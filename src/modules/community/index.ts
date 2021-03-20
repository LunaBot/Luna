import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class Community implements Module {
    public name = 'community';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const community = new Community();