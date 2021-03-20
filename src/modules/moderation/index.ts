import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class Moderation implements Module {
    public name = 'moderation';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const moderation = new Moderation();