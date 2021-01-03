import { Command } from '@/command';
import type { Message } from 'discord.js';

export class Random extends Command {
    public name = 'random';
    public command = 'random';
    public timeout = Command.TIMEOUTS.TEN_SECONDS;
    public description = 'Get a random number';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [];

    handler(_prefix: string, _message: Message, _args: string[]) {
        return `random number: ${Math.random()}`;
    }   
};
