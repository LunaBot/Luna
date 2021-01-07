import { Interaction, Message, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionType, Command } from '@/command';
import { config } from '@/config';
import { Module, moduleManager } from '@/module-manager';
import { database } from '@/database';
import { AppError } from '@/errors';
import { sql } from '@databases/pg';

export class Modules extends Command {
    public name = 'Modules';
    public command = 'modules';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
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
        name: 'compact-list',
        description: 'Compact list all of the automod modules',
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

    async handler(options: { command?: string, module?: string }, serverId: string) {
        // Bail on no command.
        if (!options) return this.infoHandler(serverId);

        const handlers = {
            enable: () => this.enableModule(serverId, options.module),
            disable: () => this.disableModule(serverId, options.module),
            list: () => this.listHandler(serverId),
            info: () => this.infoHandler(serverId, options.module),
            'compact-list': () => this.compactListHandler(serverId),
        };

        // Invalid sub command
        if (options.command !== undefined && !Object.keys(handlers).includes(options.command as keyof typeof handlers)) {
            throw new AppError('Invalid sub command!');
        }

        return handlers[options.command as keyof typeof handlers || 'list']();
    }

    // !modules enable
    async enableModule(serverId: string, moduleName?: string) {
        if (!moduleName) {
            throw new AppError('Please provide a module to enable.');
        }

        const modules = await moduleManager.getInstalledModules();
        const foundModule = modules.find(__module => __module.name.toLowerCase() === moduleName.trim().toLowerCase());

        // Bail if it's not an installed module
        if (foundModule === undefined) {
            throw new AppError('Invalid module name!');
        }

        // Set enabled in DB
        await database.query(sql`UPDATE modules SET enabled=${true} WHERE serverId=${serverId} AND name=${foundModule.name}`);

        // Enable commands for this module
        await Promise.all(foundModule.commands.map(command => {
            
        }));

        return `Enabled ${moduleName} module!`;
    }
    
    // !modules disable
    async disableModule(serverId: string, moduleName?: string) {
        if (!moduleName) {
            throw new AppError('Please provide a module to disable.');
        }

        const modules = await moduleManager.getInstalledModules();
        const foundModule = modules.find(__module => __module.name.toLowerCase() === moduleName.trim().toLowerCase());

        // Bail if it's not an installed module
        if (foundModule === undefined) {
            throw new AppError('Invalid module name!');
        }

        // Set disable in DB
        await database.query(sql`UPDATE modules SET enabled=${false} WHERE serverId=${serverId} AND name=${foundModule.name}`);

        return `Disabled ${moduleName} module!`;
    }

    // !modules
    // !modules list
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

    // !modules compact-list
    async compactListHandler(serverId: string) {
        // Convert module to string
        const moduleToString = (modules: Module[]) => modules.map(_module => `\`${_module.name}\``).join(', ');

        // Get all modules from db
        const installedModules = await moduleManager.getInstalledModules();
        const enabledModules = await moduleManager.getEnabledModules(serverId);

        // Create embeds
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL(config.PUBLIC_URL)
            .setAuthor('Modules')
            .addField('Installed', moduleToString(installedModules))
            .addField('Enabled', moduleToString(enabledModules));

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

        if (foundModule === undefined) {
            throw new AppError('Invalid module name!');
        }

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL(config.PUBLIC_URL)
            .setAuthor(foundModule.name)
            .addFields({
                name: 'Enabled',
                value: true
            }, {
                name: 'Description',
                value: foundModule.description
            });

        return embed;
    }
};