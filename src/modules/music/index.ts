import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class Music implements Module {
    public name = 'music';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const music = new Music();
