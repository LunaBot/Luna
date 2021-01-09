import { Client as SlashCommandsClient } from 'discord-slash-commands-client';
import { Client } from 'discord.js';
import { client } from '@/client';
import { Command } from '@/command';
import { envs } from '@/envs';
import { log } from '@/log';
import { moduleManager } from '@/module-manager';
import { Server } from '@/servers';
import { database } from '@/database';
import { sql } from '@databases/pg';
import pMapSeries from 'p-map-series';

// Load slash commands
const addCommands = async (client: SlashCommandsClient, serverId: Server['id'], _commands?: Command[], update = false) => {
    const commands = await Promise.all((_commands ?? moduleManager.getCommands()).map(async command => ({
        command,
        data: {
            name: command.command.substring(0, 32),
            description: command.description.substring(0, 100) ?? `The ${command.command} command.`,
            ...(command.options ? { options: command.options } : {})
        }
    })));

    // Try to add commands
    const results = await Promise.allSettled(commands.map(async ({ command, data }) => {
        log.silly('%s %s in %s', update ? 'Updating' : 'Installing', command.command, serverId);
        await client.createCommand(data as any, serverId).catch((error: any) => {
            error.extras = {
                command
            };
            throw error;
        });
        log.silly('%s %s in %s', update ? 'Updated' : 'Installed', command.command, serverId);
    }));

    // Handle errors
    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length >= 1) {
        console.log(errors);
        log.error('Failed %s %s to %s.', update ? 'updating' : 'installing', errors.map(error => {
            try {
                return (error as any).extras.command;
            } catch (error) {
                log.error('error', JSON.stringify(error, null, 2));
            };
        }).join(','), serverId);
    }

    // Log success
    log.silly('%s %s commands in %s', update ? 'Updated' : 'Installed', commands.length - errors.length, serverId);
};

const deleteCommands = async (client: SlashCommandsClient, serverId: Server['id']) => {
    const commands = await client.getCommands({
        guildID: serverId
    });
    
    // Delete commands
    await Promise.all((Array.isArray(commands) ? commands : [commands]).map(async command => {
        await client.deleteCommand(command.id, serverId);
    }));
};

const deleteGlobalCommands = async (client: Client) => {
    // @ts-expect-error
    const commandsToDelete = await client.api.applications(client.user.id).commands.get();
    await Promise.all(commandsToDelete.map(async (command: any) => {
        // @ts-expect-error
        await client.api.applications(client.user.id).commands(command.id).delete();
    })).catch((error) => log.error(JSON.stringify(error, null, 2)));
};

const updateCommands = async (client: SlashCommandsClient, serverId: Server['id']) => {
    const commandsToInstall = await client.getCommands({
        guildID: serverId
    }).then(commands => Array.isArray(commands) ? commands : [commands]).then(async commands => {
        // Remove commands already installed
        const _commands = await moduleManager.getEnabledCommands(serverId);
        return _commands.filter(command => {
            return !commands.find(installedCommand => {
                const name = installedCommand.name === command.command;
                const description = installedCommand.description === command.description.substring(0, 100);
                return name && description;
            });
        });
    });

    return addCommands(client, serverId, commandsToInstall, true);
};

const sleep = (ms: number)=> new Promise<void>(resolve => setTimeout(() => resolve(), ms));

export const ready = async () => {
    // Only install/delete slash commands on ready if we're in the production environment
    // There's no point in doing this if we're using the test/dev bot
    if (envs.NODE_ENV !== 'production') return;

    // Create interactions client
    const interactionsClient = new SlashCommandsClient(envs.BOT.TOKEN, client.user?.id!);

    // Get all servers with "slashCommands" module enabled
    const servers = await database.query(sql`SELECT serverId from modules WHERE name=${'SlashCommands'} AND enabled=${true}`).then(modules => {
        return modules.flatMap(_module => _module.serverid);
    });

    // Update slash commands
    await pMapSeries(servers, async serverId => {
        // Add slash commands to server
        // await addCommands(interactionsClient, serverId);
        log.silly(`Server: ${serverId} has slashCommands enabled.`);

        // Wait for 1s
        await sleep(1000);
    });
};