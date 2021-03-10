import type { Client } from 'discord.js';
import { Command } from './command';
import * as modules from './modules';

export const loadModules = async (client: Client) => {
    const _modules = Object.values(modules);

    // Load events
    client.logger.debug(`Loading ${_modules.reduce((eventsCount, _module) => eventsCount + Object.keys(_module.events).length, 0)} events.`);
    await Promise.all(_modules.map(async _module => {
        await Promise.all(Object.values(_module.events).map(async event => {
            client.logger.debug(`Loading event: ${event.name}`);
            client.on(event.name, event.bind(client));
        }));
    }));

    // Load commands
    client.logger.debug(`Loading ${_modules.reduce((commandsCount, _module) => commandsCount + Object.keys(_module.commands).length, 0)} commands.`);
    await Promise.all(_modules.map(async _module => {
        await Promise.all((Object.values(_module.commands) as Command[]).map(async command => {
            client.logger.debug(`Loading command: ${command.name}`);

            // Command's already loaded?
            if (client.commands.has(command.name)) {
                throw new Error(`There's already a command loaded with the name "${command.name}".`);
            }

            // Initalise command
            if (command.init) {
                command.init(client);
            }

            // Add command to client for access later
            client.commands.set(command.name, command);
        }));
    }));
};
