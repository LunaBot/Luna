import type { Client } from 'discord.js';
import { Command } from './command';
import * as events from './events';

export const loadModules = async (client: Client) => {
    // Load internal events
    client.logger.silly(`Loading ${Object.values(events).length} internal events.`);
    await Promise.all(Object.entries(events).map(async ([eventName, event]) => {
        client.logger.silly(`Loading event: ${eventName}`);
        client.on(eventName, (event as any).bind(null, client));
    }));

    // Load module events
    client.logger.debug(`Loading ${client.modules.reduce((eventsCount, commandModule) => eventsCount + Object.keys(commandModule.events).length, 0)} module events.`);
    await Promise.all(client.modules.map(async commandModule => {
        await Promise.all(Object.entries(commandModule.events).map(async ([eventName, event]) => {
            client.logger.debug(`Loading event: ${eventName}`);
            client.on(eventName, (event as any).bind(null, client));
        }));
    }));

    // Load module commands
    client.logger.debug(`Loading ${client.modules.reduce((commandsCount, commandModule) => commandsCount + Object.keys(commandModule.commands).length, 0)} module commands.`);
    await Promise.all(client.modules.map(async commandModule => {
        await Promise.all(Object.values(commandModule.commands).map(async command => {
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
