import { PathLike } from 'fs';
import { resolve as resolvePath } from 'path';
import { log } from '@/log';
import { Command } from '@/command';
import { client } from '@/client';
import { database } from './database';
import { sql } from '@databases/pg';
import { envs } from './envs';

const isCommandFilter = (command: unknown): command is Command => command instanceof Command;

interface ModuleOptions {
    /**
     * v4 UUID
     */
    id: string;
    /**
     * Human friendly name.
     */
    name: string;
    /**
     * What is this module for?
     */
    description: string;
    /**
     * If this module is enabled globally.
     */
    enabled: boolean;
    /**
     * Is this module used only for the bot owner?
     */
    internal: boolean;
    /**
     * Is this module currently broken?
     * If so only show it to the bot owner.
     */
    broken: boolean;
    commands: typeof Command [];
    events: [];
    endpoints: [];
}

export class Module {
    /**
     * v4 UUID
     */
    public id: string;
    /**
     * Human friendly name.
     */
    public name: string;
    /**
     * What is this module for?
     */
    public description: string;
    /**
     * If this module is enabled globally.
     */
    public enabled = false;
    /**
     * Is this module currently broken?
     * If so only show it to the bot owner.
     */
    public broken = false;
    /**
     * Is this module used only for the bot owner?
     */
    public internal: boolean;
    /**
     * All the commands this module comes with.
     */
    public commands: Command[];
    /**
     * All the events this module subscribes to from the "discord.js" client instance.
     */
    public events: { name: string; handler: never; }[] = [];
    /**
     * All the "express.js" routers this modules has.
     */
    public endpoints: { name: string; endpoint: never; }[] = [];

    constructor(options: ModuleOptions) {
        log.debug('Creating module %s with options (%s)', options.name, JSON.stringify(options));

        // Setup class
        this.id = options.id;
        this.name = options.name;
        this.description = options.description;
        this.internal = options.internal ?? false;
        this.enabled = options.enabled ?? false;
        this.commands = Object.values(options.commands ?? {}).map(Command => new Command());
        this.events = Object.entries(options.events ?? {}).map(([name, handler]) => ({ name, handler }));
        this.endpoints = Object.entries(options.endpoints ?? {}).map(([name, endpoint]) => ({ name, endpoint }));

        if (envs.NODE_ENV !== 'production') {
            // Log broken commands
            Object.values(options.commands ?? {}).forEach(command => {
                if (command.prototype.messageHandler === Command.prototype.messageHandler) {
                    log.warn(`${command.name} is missing their messageHandler`);
                }

                if (command.prototype.interactionHandler === Command.prototype.interactionHandler) {
                    log.warn(`${command.name} is missing their interactionHandler`);
                }
            });
        }

        // Register events
        this.events.forEach(({ name: eventName, handler: eventHandler }) => {
            log.debug('Registering %s event for %s', eventName, this.name);
            client.on(eventName, (...args: any[]) => {
                // Emit "error" event on promise rejection
                // @ts-expect-error
                Promise.resolve(eventHandler.call(eventHandler, ...args)).catch(error => {
                    // Add extras so we can more easily identify this when we log it out
                    error.extras = {
                        module: {
                            name: this.name
                        },
                        event: {
                            name: eventName
                        }
                    };
                    client.emit('eventError', error);
                });
            });
        });
    }
};

type Modules = Module[];

class ModuleManager {
    private modules: Modules;

    constructor(moduleDirectory: PathLike) {
        this.modules = this.loadModules(moduleDirectory);
    }

    public loadModules(moduleDirectory: PathLike): Module[] {
        try {
            const modules = require(moduleDirectory as string);

            // Modules loaded
            return Object.values(modules).map((_module: any) => new Module(_module));
        } catch (error) {
            console.log(error);

            // Failed loading modules
            return [];
        }
    }

    // No two modules can have the same command
    public getCommand(commandName: string) {
        return this.modules.flatMap(_module => Object.values(_module.commands)).find(command => command.command === commandName);
    }

    public getCommands(moduleName?: string) {
        if (!moduleName) {
            return this.modules.flatMap(_module => _module.commands) ?? [];
        }
        return this.modules.find(_module => _module.name === moduleName)?.commands ?? [];
    }

    public async getEnabledCommands(serverId: string) {
        const installedCommands = this.getCommands();
        return database.query(sql`SELECT * FROM commands WHERE enabled=${true} AND serverId=${serverId}`).then(enabledCommands => {
            return enabledCommands.map(enabledCommand => installedCommands.find(command => command.command === enabledCommand.command)).filter<Command>(isCommandFilter);
        });
    }

    public getEvent(moduleName: string, eventName: string) {
        const _module = this.modules.find(_module => _module.name === moduleName);
        if (_module) {
            return _module.events.find(event => event.name === eventName);
        }
    }

    public getEvents(moduleName?: string) {
        if (!moduleName) {
            return this.modules.flatMap(_module => _module.events) ?? [];
        }
        return this.modules.find(_module => _module.name === moduleName)?.events ?? [];
    }

    public async getEnabledModules(serverId: string) {
        const installedModules = this.modules;
        const enabledModules: {
            id: string,
            name: string,
            enabled: boolean,
            serverId: string
        }[] = await database.query(sql`SELECT * FROM modules WHERE enabled=${true} AND serverId=${serverId}`);
        const modules = installedModules.map(enabledModule => {
            const foundModule = enabledModules.find(_module => _module.name === enabledModule.name);
            return foundModule ? {
                ...foundModule,
                enabled: true
            } : {
                ...enabledModule,
                enabled: false
            };
        }) as Module[];

        return modules.filter(_module => _module.enabled);
    }

    public async getInstalledModules() {
        return this.modules;
    }

    public async getInstalledModule(name: string) {
        return this.modules.find(_module => _module.name.toLowerCase() === name.toLowerCase());
    }
};

export const moduleManager = new ModuleManager(resolvePath(__dirname, 'modules'));
