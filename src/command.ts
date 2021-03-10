import type { Client } from "discord.js";
import { Message } from "discord.js";

export class Command {
    constructor(public name: string) {}

    init?(client: Client): void {};
    run(client: Client, message: Message, args: string[]): void {
        throw new Error('Method not implemented.');
    }
};
