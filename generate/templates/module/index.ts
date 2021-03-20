import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class __ModuleName__ implements Module {
    public name = '__module-name__';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const __moduleName__ = new __ModuleName__();