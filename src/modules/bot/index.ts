import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class Bot implements Module {
    public name = 'bot';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const bot = new Bot();