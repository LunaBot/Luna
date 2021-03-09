import type { Client } from "discord.js";
import { Message } from "discord.js";

export abstract class Command {
    constructor(public name: string) {}

    abstract run(client: Client, message: Message, args: string[]): any;
};
