import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class fun implements Module {
    public name = 'Fun';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const Fun = new fun();
