import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class Welcome implements Module {
    public name = 'welcome';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const welcome = new Welcome();