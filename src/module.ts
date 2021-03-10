import type { Client } from "discord.js";

export class Module {
    public commands = {};
    public events = {};

    constructor(public name: string) {}

    init?(client: Client): void {};
};
