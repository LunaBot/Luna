import { Module } from '@lunabot/kaspar';
import * as commands from './commands';
import * as events from './events';

class AuditLog implements Module {
    public name = 'audit-log';

    public commands = commands;
    public events = events;

    constructor() {}
}

export const auditLog = new AuditLog();