import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class AutoRole implements Module {
    public name = 'auto-role';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const autoRole = new AutoRole();