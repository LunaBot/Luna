import router from 'express-promise-router';
import { AppError } from '@/errors';
import { Server } from '@/servers';
import { moduleManager } from '@/module-manager';
import { database } from '@/database';
import { sql } from '@databases/pg';
import { isOwnerOfGuild } from '@/middleware';

const api = router();

/**
 * Middleware to only allow OWNERs to update server details
 */
api.use(async (request, response, next) => {
    // If it's a GET then continue
    // The route handler itself is then responsible
    // for handling verifying the user has access
    if (request.method.toLowerCase() === 'get') return next();

    // Bail if they have no session
    if (!request.user) throw new AppError('No valid session.');

    // Check the current user is the owner
    return isOwnerOfGuild(request, response, next);
});

/**
 * User of the currently authenticated user.
 */
api.get('/users/@me', async (request, response) => {
    const user = request.user;
    if (!user) {
        const error = new AppError('No valid session.');
        error.code = 401;
        throw error;
    }

    return response.send({
        ...user,
        guilds: user.guilds
    });
});

/**
 * Middleware to validate "serverId" param
 */
api.use('/servers/:serverId', async (request, _response, next) => {
    const serverId = request.params.serverId;
    const server = await Server.find({ id: serverId });
    if (!server) {
        throw new AppError('Invalid server ID');
    }

    // Is the user a member of this server?
    const guild = request.user?.guilds?.find(guild => guild.id === serverId);
    if (!guild) {
        const error = new AppError('Access denied!');
        error.code = 403;
        throw error;
    }

    // Has "ADMINISTRATOR" permission
    const isAdmin = (guild.permissions & 0x8) === 0x8;
    // Has "MANAGE_SERVER" permission
    const isModerator = (guild.permissions & 0x20) === 0x20;

    // Is the user an owner/admin/moderator in this server?
    if (!guild.owner && !isAdmin && !isModerator) {
        const error = new AppError('Access denied!');
        error.code = 403;
        throw error;
    }

    // User is either an owner, admin or moderator
    return next();
});

/**
 * Server's details
 */
api.get('/servers/:serverId', async (request, response) => {
    const serverId = request.params.serverId;
    const server = await Server.find({ id: serverId });
    return response.send(server);
});

/**
 * Module's details
 */
api.get('/servers/:serverId/modules', async (request, response) => {
    const serverId = request.params.serverId;
    // Get modules and commands
    const dbModules = await database.query<{ id: string, name: string, enabled: boolean }>(sql`SELECT * FROM modules WHERE serverId=${serverId}`);
    const dbCommands = await database.query<{
        id: string,
        command: string,
        enabled: boolean,
        allowedroles: string[],
        deniedroles: string[]
    }>(sql`SELECT * FROM commands WHERE serverId=${serverId}`);
    const modules = await moduleManager.getInstalledModules().then(modules => {
        return modules
            // Remove modules without commands
            .filter(_module => _module.commands.length >= 1)
            // Add in the db details about each module
            .map(_module => {
                // Ensure we always lowercase both names
                // The DB/module may change case at any point
                // We do not guarantee correctness of this.
                const options = dbModules.find(dbModule => dbModule.name.toLowerCase() === _module.name.toLowerCase());
                // Get all commands for this module
                const commands = _module.commands.map(command => {
                    const dbCommand = dbCommands.find(dbCommand => dbCommand.command === command.command);
                    return {
                        ...command,
                        enabled: dbCommand?.enabled ?? false,
                        allowedRoles: (dbCommand?.allowedroles ?? []).map(role => role === '*' ? '@everyone' : role),
                        deniedRoles: (dbCommand?.deniedroles ?? []).map(role => role === '*' ? '@everyone' : role),
                    };
                })
                return {
                    ..._module,
                    id: options?.id,
                    enabled: options?.enabled ?? false,
                    commands
                };
            });
    });

    response.send(modules);
});

/**
 * Single module's details
 */
api.get('/servers/:serverId/modules/:moduleName', async (request, response) => {
    const serverId = request.params.serverId;
    const moduleName = request.params.moduleName;
    const server = await Server.find({ id: serverId });
    if (!server) {
        throw new AppError('Invalid server ID');
    }

    // Get module and commands
    // @TODO: remove the need to get EVERY module just to look up one
    const query = sql`SELECT * FROM modules WHERE name ILIKE ${moduleName}`;
    const options = await database.query<{ id: string, name: string, enabled: boolean }>(query).then(rows => rows[0]);
    // Bail if we have no module
    if (!options) throw new AppError('Invalid Module name');
    const dbCommands = await database.query<{
        id: string,
        command: string,
        enabled: boolean,
        allowedroles: string[],
        deniedroles: string[]
    }>(sql`SELECT * FROM commands WHERE serverId=${serverId}`);
    // Add in the db details about the module
    const _module = await moduleManager.getInstalledModule(moduleName).then(_module => {
        // Ensure we always lowercase both names
        // The DB/module may change case at any point
        // We do not guarantee correctness of this.
        // Get all commands for this module
        const commands = _module?.commands.map(command => {
            const dbCommand = dbCommands.find(dbCommand => dbCommand.command === command.command);
            return {
                ...command,
                enabled: dbCommand?.enabled || false,
                allowedRoles: (dbCommand?.allowedroles || []).map(role => role === '*' ? '@everyone' : role),
                deniedRoles: (dbCommand?.deniedroles || []).map(role => role === '*' ? '@everyone' : role),
            };
        })
        return {
            ..._module,
            id: options?.id,
            enabled: options?.enabled || false,
            commands
        };
    });

    response.send(_module);
});

/**
 * Update a command for a single server
 */
api.patch('/servers/:serverId/modules/:moduleName/commands/:command', async (request, response) => {
    // {
    //     body: { enabled: false, name: 'Level' },
    //     params: {
    //         serverId: '794131371999494146',
    //         moduleName: 'levels',
    //         command: 'Level'
    //     }
    // }
    const enabled = Boolean(request.body.enabled);
    const serverId = request.params.serverId;
    const moduleName = request.params.moduleName;
    const command = request.params.command;

    // Update DB
    await database.query(sql`UPDATE commands SET enabled=${enabled} WHERE serverId=${serverId} AND command=${command}`);

    // Success
    response.send(200);
});

// // Settings
// settings.get('/dashboard/:serverId/settings', async (request, response) => {
//     const serverId = request.params.serverId;
//     const server = await Server.find({ id: serverId });
//     if (!server) {
//         throw new AppError('Invalid server ID');
//     }

//     const Toggle = Vue.component('toggle', {
//         props: {
//             enabled: Boolean,
//         },
//         data() {
//             return {
//                 toggleActive: false
//             };
//         },
//         mounted() {
//             // Push prop into local state on mount
//             this.toggleActive = this.enabled;
//         },
//         template: dedent`
//             <div class="flex justify-between items-center" @click="toggleActive = !toggleActive">
//                 <h2>Toggle me</h2>
//                 <div class="w-16 h-10 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out" :class="{ 'bg-green-400': toggleActive}">
//                     <div class="bg-white w-8 h-8 rounded-full shadow-md transform duration-300 ease-in-out" :class="{ 'translate-x-6': toggleActive,}"></div>
//                 </div>
//             </div>
//         `,
//     });
//     const CommandRow = Vue.component('command-row', {
//         data() {
//             return {
//                 types: {
//                     1: 'SUB_COMMAND',
//                     2: 'SUB_COMMAND_GROUP',
//                     3: 'STRING',
//                     4: 'INTEGER',
//                     5: 'BOOLEAN',
//                     6: 'USER',
//                     7: 'CHANNEL',
//                     8: 'ROLE',
//                 }
//             };
//         },
//         props: {
//             command: Object,
//         },
//         template: dedent`
//             <tr class="text-left bg-white border-4 border-gray-200">
//                 <td>
//                     <span class="font-semibold">{{ command.name }}</span>
//                 </td>
//                 <td>
//                     <span><code>{{ command.command }}</code></span>
//                 </td>
//                 <td>
//                     <input type="checkbox" :id="command.id" :name="command.name" v-bind="{ checked: command.enabled }">
//                 </td>
//                 <td>
//                     <span v-html="command.allowedRoles.map(role => '<code>' + role + '</code>').join(', ')"></span>
//                 </td>
//                 <td>
//                     <span v-html="command.deniedRoles.map(role => '<code>' + role + '</code>').join(', ')"></span>
//                 </td>
//                 <td>
//                     <span v-html="command.permissions.map(role => '<code>' + role + '</code>').join(', ')"></span>
//                 </td>
//             </tr>
//         `
//     });
//     const CommandTable = Vue.component('command-table', {
//         props: {
//             id: String,
//             name: String,
//             commands: Array,
//             enabled: Boolean
//         },
//         components: {
//             CommandRow
//         },
//         template: dedent`
//             <div>
//                 <div class="p-8">
//                     <h1 class="text-3xl">{{ name }} <toggle v-bind="{ enabled }" /></h1>
//                     <table class="min-w-full table-auto">
//                         <thead class="justify-between">
//                             <tr class="text-left bg-gray-800">
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Name</span>
//                                 </th>
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Command</span>
//                                 </th>
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Enabled</span>
//                                 </th>
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Allowed Roles</span>
//                                 </th>
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Denied Roles</span>
//                                 </th>
//                                 <th class="px-2 py-2">
//                                     <span class="text-gray-300">Permissions</span>
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody class="bg-gray-200">
//                             <command-row v-for="(command, index) in commands" :key="command.id" v-bind="{ command }" />
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         `,
//     });
//     // Get modules and commands
//     const dbModules = await database.query<{ id: string, name: string, enabled: boolean }>(sql`SELECT * FROM modules WHERE serverId=${serverId}`);
//     const dbCommands = await database.query<{
//         id: string,
//         command: string,
//         enabled: boolean,
//         allowedroles: string[],
//         deniedroles: string[]
//     }>(sql`SELECT * FROM commands WHERE serverId=${serverId}`);
//     const modules = await moduleManager.getInstalledModules().then(modules => {
//         return modules
//             // Remove modules without commands
//             .filter(_module => _module.commands.length >= 1)
//             // Add in the db details about each module
//             .map(_module => {
//                 // Ensure we always lowercase both names
//                 // The DB/module may change case at any point
//                 // We do not guarantee correctness of this.
//                 const options = dbModules.find(dbModule => dbModule.name.toLowerCase() === _module.name.toLowerCase());
//                 // Get all commands for this module
//                 const commands = _module.commands.map(command => {
//                     const dbCommand = dbCommands.find(dbCommand => dbCommand.command === command.command);
//                     return {
//                         ...command,
//                         enabled: dbCommand?.enabled ?? false,
//                         allowedRoles: (dbCommand?.allowedroles ?? []).map(role => role === '*' ? '@everyone' : role),
//                         deniedRoles: (dbCommand?.deniedroles ?? []).map(role => role === '*' ? '@everyone' : role),
//                     };
//                 })
//                 return {
//                     ..._module,
//                     enabled: options?.enabled ?? false,
//                     commands
//                 };
//             });
//     });
//     return createVueEndpoint({
//         app: new Vue({
//             data() {
//                 return {
//                     modules
//                 };
//             },
//             components: {
//                 CommandTable,
//                 Toggle
//             },
//             template: dedent`
//                 <div id="app">
//                     <command-table v-for="(module, index) in modules" :key="module.id" v-bind="{
//                         id: module.id,
//                         name: module.name,
//                         commands: module.commands,
//                         enabled: module.enabled
//                     }" />
//                 </div>
//             `,
//         }),
//         context: {
//             title: 'Automod - Settings - Commands',
//         }
//     })(request, response);
// });

export {
    api
};
