import { sql } from '@databases/pg';
import type { Message, APIMessageContentResolvable, MessageOptions, MessageAdditions, Interaction, PermissionString } from 'discord.js';
import { database } from './database';
import { AppError } from './errors';
import { Server } from './servers';

const ONE_SECOND = 1000;
const FIVE_SECONDS = ONE_SECOND * 5;
const TEN_SECONDS = ONE_SECOND * 10;
const THIRTY_SECONDS = ONE_SECOND * 30;
const ONE_MINUTE = ONE_SECOND * 60;
const FIVE_MINUTES = ONE_MINUTE * 5;
const TEN_MINUTES = ONE_MINUTE * 10;

export interface CommandOptions {
    name: string;
    command: string;
    timeout: number;
    description: string;
    hidden: boolean;
    owner: boolean;
    examples: string[];
    roles: string[];
}

type CommandResult = APIMessageContentResolvable | (MessageOptions & { split?: false }) | MessageAdditions | string;

export enum ApplicationCommandOptionType {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
}

export interface ApplicationCommandOptionChoice {
    name: String;
    field: String;
}

export interface CommandOption {
    // 1-32 character name matching ^[\w-]{1,32}$
    name: String;
    // 1-100 character description
    description: String;
    // value of ApplicationCommandOptionType
    type: ApplicationCommandOptionType;
    // The first required option for the user to complete--only one option can be default
    default?: Boolean;
    // If the parameter is required or optional--default false
    required?: Boolean;
    // array of ApplicationCommandOptionChoice	choices for string and int types for the user to pick from
    choices?: ApplicationCommandOptionChoice
    // array of ApplicationCommandOption	if the option is a subcommand or subcommand group type, this nested options will be the parameters
    options?: CommandOption[]
}

export class Command {
    /**
     * Human friendly name.
     */
    public name: string = 'command';
    /**
     * What should we look for to trigger this?
     */
    public command: string = 'command';
    /**
     * Is this command currently broken?
     * If so it'll only show up for the bot owner.
     */
    public broken = false;
    /**
     * How long should we wait before returning timeout message?
     */
    public timeout: number = 5000;
    /**
     * What does this command do?
     */
    public description: string = 'A basic command';
    /**
     * Should we hide this command from the "commands" menu?
     */
    public hidden: boolean = false;
    /**
     * Is this command only for the bot owner?
     */
    public internal: boolean = false;
    /**
     * How is this command used?
     */
    public examples: string[] = [];
    /**
     * What Discord permissions are needed to use this command?
     */
    public permissions: PermissionString[] = [];
    /**
     * What Discord options are needed to use this command?
     */
    public options: CommandOption[] = [];

    /**
     * Well known times.
     * Try to avoid using random timeouts.
     */
    static TIMEOUTS = {
        ONE_SECOND,
        FIVE_SECONDS,
        TEN_SECONDS,
        THIRTY_SECONDS,
        ONE_MINUTE,
        FIVE_MINUTES,
        TEN_MINUTES
    };

    /**
     * Is this command enabled?
     */
    public async isEnabled(serverId: Server['id']) {
        return database.query<{ enabled: boolean }>(sql`SELECT enabled FROM commands WHERE serverId=${serverId} AND command=${this.command};`).then(commands => {
            return commands[0]?.enabled ?? false;
        });
    }

    public async getAllowedRoles(serverId: Server['id']) {
        return database.query<{ allowedroles: string[] }>(sql`SELECT allowedRoles FROM commands WHERE serverId=${serverId} AND command=${this.command};`).then(commands => {
            return commands[0]?.allowedroles ?? [];
        });
    }

    public async getDeniedRoles(serverId: Server['id']) {
        return database.query<{ deniedroles: string[] }>(sql`SELECT deniedRoles FROM commands WHERE serverId=${serverId} AND command=${this.command};`).then(commands => {
            return commands[0]?.deniedroles ?? [];
        });
    }

    /**
     * Handle "message" commands.
     */
    messageHandler(_prefix: string, _message: Message, _args: string[]): Promise<CommandResult | undefined> | CommandResult | undefined | void {
        throw new AppError(`% is missing it's messageHandler.`, this.command);
    }

    /**
     * Handle "interaction" commands.
     */
    interactionHandler(_prefix: string, _interaction: Interaction): Promise<CommandResult | undefined> | CommandResult | undefined | void {
        throw new AppError(`% is missing it's interactionHandler.`, this.command);
    }
};
