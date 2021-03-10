import { Module } from "../../module";
import * as commands from './commands';

class Community implements Module {
    public id = 'COMMUNITY';
    public name = 'Community';

    public commands = commands;
    public events = {};

    constructor() {}
}

export const community = new Community();