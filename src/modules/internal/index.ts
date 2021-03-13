import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class Internal implements Module {
    public name = 'Internal';
    public internal = true;

    public commands = commands;
    public events = events;

    constructor() {}
}

export const internal = new Internal();