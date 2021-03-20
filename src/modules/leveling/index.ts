import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class Leveling implements Module {
    public name = 'leveling';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const leveling = new Leveling();