import type { Client } from 'discord.js';
import { Collection } from 'discord.js';
import { Message } from 'discord.js';

export class Command {
    public paramaters?: Collection<string, { type: 'string' | 'boolean' | 'number' | 'mention'; optional?: boolean; }> = new Collection();

    constructor(public name: string) {}

    init?(client: Client): void {};

    /**
     * Main command method
     */
    run(client: Client, message: Message, args: string[]): void {
        throw new Error('Method not implemented.');
    }

    /**
     * Get the help text in this current context
     */
    getHelpText(client: Client, message: Message) {
        throw new Error('Method not implemented');
    }
};
