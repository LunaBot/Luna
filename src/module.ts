import type { Client } from 'discord.js';
import type { Command } from './command';

export class Module {
    public commands: Record<string, Command> = {};
    public events = {};

    constructor(public name: string) {}

    init?(client: Client): void {};
};
