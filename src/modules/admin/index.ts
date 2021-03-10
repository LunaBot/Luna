import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class Admin implements Module {
    public name = 'admin';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const admin = new Admin();