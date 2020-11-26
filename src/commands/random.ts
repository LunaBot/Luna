import type { Message } from 'discord.js';
import { Command } from '../command';

class Random extends Command {
    public name = 'random';
    public command = 'random';
    public timeout = Command.TIMEOUTS.TEN_SECONDS;
    public description = '';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [];

    handler(_prefix: string, _message: Message, _args: string[]) {
        return `random number: ${Math.random()}`;
    }   
};

export default new Random();