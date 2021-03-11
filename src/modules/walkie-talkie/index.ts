import { Module } from '../../module';
import * as commands from './commands';
import * as events from './events';

class WalkieTalkie implements Module {
    public name = 'walkieTalkie';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const walkieTalkie = new WalkieTalkie();