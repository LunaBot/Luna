import dedent from 'dedent';
import router from 'express-promise-router';
import Vue from 'vue';
import { moduleManager } from '@/module-manager';
import { createVueEndpoint } from '@/utils';

const wiki = router();

// Home page
wiki.get('/wiki', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod - wiki',
        }
    })(request, response);
});

// Commands homepage
wiki.get('/wiki/commands', async (request, response) => {
    const CommandRow = Vue.component('command-row', {
        data() {
            return {
                types: {
                    1: 'SUB_COMMAND',
                    2: 'SUB_COMMAND_GROUP',
                    3: 'STRING',
                    4: 'INTEGER',
                    5: 'BOOLEAN',
                    6: 'USER',
                    7: 'CHANNEL',
                    8: 'ROLE',
                }
            };
        },
        props: {
            command: Object,
        },
        template: dedent`
            <tr class="text-left bg-white border-4 border-gray-200">
                <td>
                    <span class="font-semibold">{{ command.name }}</span>
                </td>
                <td>
                    <span><code>{{ command.command }}</code></span>
                </td>
                <td>
                    <span>{{ command.description }}</span>
                </td>
                <td>
                    <div v-for="option in command.options" :key="option.name">
                        <code>{{ option.name }}({{ types[option.type] }})</code> - {{ option.description }}
                    </div>
                </td>
                <td>
                    <span v-html="command.permissions.map(permission => '<code>' + permission + '</code>').join(',')"></span>
                </td>
            </tr>
        `
    });
    const CommandTable = Vue.component('command-table', {
        props: {
            title: String,
            commands: Array
        },
        components: {
            CommandRow
        },
        template: dedent`
            <div>
                <div class="p-8">
                    <h1 class="text-3xl">{{ title }}</h1>
                    <table class="min-w-full table-auto">
                        <thead class="justify-between">
                            <tr class="text-left bg-gray-800">
                                <th class="px-2 py-2">
                                    <span class="text-gray-300">Name</span>
                                </th>
                                <th class="px-2 py-2">
                                    <span class="text-gray-300">Command</span>
                                </th>
                                <th class="px-2 py-2">
                                    <span class="text-gray-300">Description</span>
                                </th>
                                <th class="px-2 py-2">
                                    <span class="text-gray-300">Options</span>
                                </th>
                                <th class="px-2 py-2">
                                    <span class="text-gray-300">Permissions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-gray-200">
                            <command-row v-for="(command, index) in commands" :key="command.id" v-bind="{ command }" />
                        </tbody>
                    </table>
                </div>
            </div>
        `,
    });
    // Get installed modules
    const modules = await moduleManager.getInstalledModules().then(modules => {
        return modules.filter(_module => _module.commands.length >= 1);
    });
    return createVueEndpoint({
        app: new Vue({
            data() {
                return {
                    modules
                };
            },
            components: {
                CommandTable
            },
            template: dedent`
                <div>
                    <command-table v-for="(module, index) in modules" :key="module.id" v-bind="{ commands: module.commands, title: module.name }" />
                </div>
            `,
        }),
        context: {
            title: 'Automod - Commands',
        }
    })(request, response);
});

// Health
wiki.get('/wiki/health', (_req, res) => {
    res.send('OK');
});

export {
    wiki
};
