import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class Games implements Module {
    public name = 'games';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const games = new Games();
