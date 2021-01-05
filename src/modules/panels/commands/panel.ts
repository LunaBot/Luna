import { ApplicationCommandOptionType, Command } from '@/command';
import { AppError } from '@/errors';
import { moduleManager } from '@/module-manager';
import { Help } from '@/modules/bot/commands/help';
import type { Interaction, Message } from 'discord.js';

export class Panel extends Command {
    public name = 'Panel';
    public command = 'panel';
    public timeout = 2000;
    public description = 'Manage panels';
    public hidden = false;
    public owner = false;
    public examples = [ '!panel create roles #roles' ];
    public options = [{
        name: 'create',
        description: 'Create panel',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'name',
            description: 'Panel name',
            required: true,
            type: ApplicationCommandOptionType.STRING
        }, {
            name: 'channel',
            description: 'Where should I post the panel?',
            type: ApplicationCommandOptionType.CHANNEL
        }]
    }, {
        name: 'delete',
        description: 'Delete panel',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'name',
            description: 'Panel name',
            type: ApplicationCommandOptionType.STRING
        }, {
            name: 'id',
            description: 'Panel ID',
            type: ApplicationCommandOptionType.STRING
        }]
    }, {
        name: 'edit',
        description: 'Edit panel',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'name',
            description: 'Panel name',
            type: ApplicationCommandOptionType.STRING
        }, {
            name: 'id',
            description: 'Panel ID',
            type: ApplicationCommandOptionType.STRING
        }, {
            name: 'channel',
            description: 'Where should I post the panel?',
            type: ApplicationCommandOptionType.CHANNEL
        }]
    }];

    async messageHandler(prefix: string, _message: Message, args: string[]) {
        return this.handler({
            command: args[0],
            name: args[1],
            id: args[1],
        }, prefix);
    }

    async interactionHandler(prefix: string, interaction: Interaction) {
        return this.handler({
            command: interaction.options ? interaction.options[0].name : 'info',
        }, prefix);
    }

    async handler(options: { command?: string, name?: string, id?: string }, prefix: string) {
        const commands = {
            info: () => this.infoHandler(prefix),
            create: () => this.createHandler(options.name),
            delete: () => this.deleteHandler(options.name, options.id),
            edit: () => this.editHandler(options.name, options.id),
        };

        // Invalid command
        if (!Object.keys(commands).includes(options.command as keyof typeof commands)) {
            // @todo: Make a new error for this
            throw new AppError('Invalid subcommand');
        }

        return commands[options.command as keyof typeof commands]();
    }

    async infoHandler(prefix: string) {
        // Return bot info
        const help = moduleManager.getCommand('help') as Help;
        return help.handler(prefix, 'panel');
    }

    async createHandler(name?: string) {
        if (!name) {
            throw new AppError('Please provide a panel name to create it.');
        }

        return `Creating ${name}`;
    }

    async deleteHandler(name?: string, id?: string) {
        if (!name && !id) {
            throw new AppError('Please provide a panel ID or name to delete.');
        }

        return `Deleting ${name ?? id}`;
    }

    async editHandler(name?: string, id?: string) {
        if (!name && !id) {
            throw new AppError('Please provide a panel ID or name to edit.');
        }

        return `Finished editing ${name ?? id}`;
    }
};
