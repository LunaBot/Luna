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
    name: string = 'command';
    command: string = 'command';
    timeout: number = 5000;
    description: string = 'A basic command';
    hidden: boolean = false;
    owner: boolean = false;
    examples: string[] = [];
    roles: string[] = [];

    static TIMEOUTS = {
        ONE_SECOND,
        FIVE_SECONDS,
        TEN_SECONDS,
        THIRTY_SECONDS,
        ONE_MINUTE,
        FIVE_MINUTES,
        TEN_MINUTES
    };

    handler(_prefix: string, _message: Message, _args: string[]): Promise<CommandResult> | CommandResult {
        throw new Error('Not implemented');
    }
};
