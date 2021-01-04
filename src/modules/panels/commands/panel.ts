import { ApplicationCommandOptionType, Command } from '@/command';
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
            type: ApplicationCommandOptionType.STRING
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
        }]
    }];

    async messageHandler(_prefix: string, _message: Message, _args: string[]) {
        return this.handler();
    }

    async interactionHandler(_prefix: string, _interaction: Interaction) {
        return this.handler();
    }

    async handler() {
        return `Coming soon!`;
    }
};
