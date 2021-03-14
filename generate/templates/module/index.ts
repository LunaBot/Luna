import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class __Modulename__ implements Module {
    public name = '__modulename__';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const __modulename__ = new __Modulename__();