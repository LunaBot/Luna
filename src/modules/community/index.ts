import { Module } from "../../module";
import * as commands from './commands';

class Community implements Module {
    public name = 'community';

    public commands = commands;
    public events = {};

    constructor() {}
}

export const community = new Community();