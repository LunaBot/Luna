import type { Message, APIMessageContentResolvable, MessageOptions, MessageAdditions } from 'discord.js';

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

export class Command {
    public name: string = 'command';
    public command: string = 'command';
    public timeout: number = 5000;
    public description: string = 'A basic command';
    public hidden: boolean = false;
    public owner: boolean = false;
    public examples: string[] = [];
    public roles: string[] = [];
    public arguments = {
        minimum: 0,
        maximum: Infinity
    };

    static TIMEOUTS = {
        ONE_SECOND,
        FIVE_SECONDS,
        TEN_SECONDS,
        THIRTY_SECONDS,
        ONE_MINUTE,
        FIVE_MINUTES,
        TEN_MINUTES
    };

    // @todo: Add in support for detecting if id was pinged
    protected getIdFromMessage(message: string) {
        const trimmedMessage = `${message}`.trim();
        if (trimmedMessage.startsWith('<') && trimmedMessage.endsWith('>')) {
            const id = message.split('<')[1];
            return id.substr(0, id.length - 1).replace('@', '').replace('#', '').replace('!', '');
        }
    }

    handler(_prefix: string, _message: Message, _args: string[]): Promise<CommandResult> | CommandResult {
        throw new Error('Not implemented');
    }
};
