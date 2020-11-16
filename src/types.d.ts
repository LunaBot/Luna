import { Message } from 'discord.js';

export interface Command {
    name: string;
    command: string;
    description: string;
    roles: string[];
    handler(message: Message, args: string[]): void;
};
