import { Interaction, Message, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionType, Command } from '@/command';
import { config } from '@/config';
import { moduleManager } from '@/module-manager';
import { database } from '@/database';
import { AppError } from '@/errors';
import { sql } from '@databases/pg';

export class Modules extends Command {
    public name = 'Modules';
    public command = 'modules';
    public timeout = 5000;
    public description = 'List all of the AutoMod modules.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['ADMINISTRATOR' as const];
    public options = [{
        name: 'list',
        description: 'List all of the automod modules',
        type: ApplicationCommandOptionType.SUB_COMMAND,
    }, {
        name: 'info',
        description: 'Info on a specific module',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'module',
            description: 'Name of the module',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        }]
    }, {
        name: 'enable',
        description: 'Enable a module',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'module',
            description: 'Name of the module',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        }]
    }, {
        name: 'disable',
        description: 'Disable a module',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'module',
            description: 'Name of the module',
            type: ApplicationCommandOptionType.STRING,
            required: true,
        }]
    }];

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        return this.handler({
            command: args[0],
            module: args[1]
        }, message.guild!.id)
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler({
            command: interaction.options ? interaction.options[0].name : 'info',
            module: interaction.options ? interaction.options[1].name : undefined,
        }, interaction.guild.id);
    }

    async handler({ command, module: _module }: { command?: string, module?: string }, serverId: string) {
        const handlers = {
            enable: () => this.enableModule(serverId, _module),
            disable: () => this.disableModule(serverId, _module),
            list: () => this.listHandler(serverId),
            info: () => this.infoHandler(serverId, _module),
        };

        // Invalid sub command
        if (command !== undefined && !Object.keys(handlers).includes(command as keyof typeof handlers)) {
            throw new AppError('Invalid sub command!');
        }

        return handlers[command as keyof typeof handlers || 'list']();
    }

    // !modules enable
    async enableModule(serverId: string, moduleName?: string) {
        if (!moduleName) {
            throw new AppError('Please provide a module to enable.');
        }

        const modules = await moduleManager.getInstalledModules();
        const foundModule = modules.find(__module => __module.name.toLowerCase() === moduleName.trim().toLowerCase());
        const moduleisValid = foundModule !== undefined;

        // Bail if it's not an installed module
        if (!moduleisValid) {
            throw new AppError('Invalid module name!');
        }

        // Set enabled in DB
        await database.query(sql`UPDATE modules SET enabled=${true} WHERE serverId=${serverId} AND name=${moduleName}`);

        return `Enabled ${moduleName} module!`;
    }
    
    // !modules disable
    async disableModule(serverId: string, moduleName?: string) {
        if (!moduleName) {
            throw new AppError('Please provide a module to disable.');
        }

        const modules = await moduleManager.getInstalledModules();
        const foundModule = modules.find(__module => __module.name.toLowerCase() === moduleName.trim().toLowerCase());
        const moduleisValid = foundModule !== undefined;

        // Bail if it's not an installed module
        if (!moduleisValid) {
            throw new AppError('Invalid module name!');
        }

        // Set disable in DB
        await database.query(sql`UPDATE modules SET enabled=${false} WHERE serverId=${serverId} AND name=${moduleName}`);

        return `Disabled ${moduleName} module!`;
    }

    // !modules
    async listHandler(serverId: string) {
        // Get all modules from db
        const modules = await moduleManager.getEnabledModules(serverId);

        // Create embeds
        const fields = modules.map(_module => {
            return {
                name: _module.name,
                value: _module.enabled ? ':white_check_mark: Enabled' : ':no_entry_sign: Disabled'
            };
        });

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL(config.PUBLIC_URL)
            .setAuthor('Modules')
            .addFields(fields);

        return embed;
    }

    // !modules AutoRole
    async infoHandler(serverId: string, moduleName?: string) {
        if (!moduleName) {
            throw new AppError('Please provide a module name.');
        }

        // Get all modules from db
        const modules = await moduleManager.getEnabledModules(serverId);
        const foundModule = modules.find(__module => __module.name.toLowerCase() === moduleName.trim().toLowerCase());
        const moduleisValid = foundModule !== undefined;

        if (!moduleisValid) {
            throw new AppError('Invalid module name!');
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL(config.PUBLIC_URL)
            .setAuthor(moduleName)
            .addFields({
                name: 'Enabled',
                value: true
            });

        return embed;
    }
};