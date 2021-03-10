import type { Client } from 'discord.js';
import { Command } from './command';

export const loadModules = async (client: Client) => {
    // Load events
    client.logger.debug(`Loading ${client.modules.reduce((eventsCount, _module) => eventsCount + Object.keys(_module.events).length, 0)} events.`);
    await Promise.all(client.modules.map(async _module => {
        await Promise.all(Object.entries(_module.events).map(async ([eventName, event]) => {
            client.logger.debug(`Loading event: ${eventName}`);
            client.on(eventName, (event as any).bind(null, client));
        }));
    }));

    // Load commands
    client.logger.debug(`Loading ${client.modules.reduce((commandsCount, _module) => commandsCount + Object.keys(_module.commands).length, 0)} commands.`);
    await Promise.all(client.modules.map(async _module => {
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
