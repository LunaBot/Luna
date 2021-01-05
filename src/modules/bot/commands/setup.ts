import { Command } from '@/command';
import { database } from '@/database';
import { AppError } from '@/errors';
import { isTextChannel } from '@/guards';
import { moduleManager } from '@/module-manager';
import pMapSeries from 'p-map-series';
import { sql } from '@databases/pg';
import type { Message, CollectorFilter, Interaction, Channel, TextChannel, DMChannel } from 'discord.js';
import { v4 as uuid } from 'uuid';

const filter: CollectorFilter = (response) => !response.author.bot;
const waitForRoles = async (channel: TextChannel | DMChannel) => {
    return channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] }).then(collected => {
        return collected.array().flatMap(answer => [...answer.mentions.roles.array()].flatMap(role => role.id));
    }).catch(_collected => {
        throw new AppError('You took too long to respond.');
    });
};
const waitForBoolean = async (channel: TextChannel | DMChannel) => {
    return channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] }).then(collected => {
        return Array.from(collected.values()).flatMap((answer) => {
            return answer.content.toString().toLowerCase().includes('yes') ?? answer.content.toString().toLowerCase().includes('true');
        })[0];
    }).catch(_collected => {
        throw new AppError('You took too long to respond.');
    });
};

export class Setup extends Command {
    public name = 'Setup';
    public command = 'setup';
    public timeout = 60000;
    public description = 'Set me up captain!';
    public hidden = false;
    public owner = true;
    public examples = [];
    public permissions = ['ADMINISTRATOR' as const];
    public options = [];

    messageHandler(_prefix: string, message: Message, _args: string[]) {
        return this.handler({}, message.guild!.id, message.channel);
    }

    interactionHandler(_prefix: string, _interaction: Interaction) {
        return this.handler({}, _interaction.guild!.id, _interaction.channel);
    }

    async handler({}, serverId: string, channel: Channel) {
        if (isTextChannel(channel)) {
            // Get admin roles
            const adminRoles = await this.getRoles('admin', channel);

            // Update admin roles
            if (adminRoles) {
                await database.query(sql`UPDATE servers SET adminRoles=${adminRoles} WHERE id=${serverId}`);
            }

            // Get mod roles
            const modRoles = await this.getRoles('mod', channel);

            // Update mod roles
            if (modRoles) {
                await database.query(sql`UPDATE servers SET modRoles=${modRoles} WHERE id=${serverId}`);
            }

            // Get enabled modules
            const installedModules = await moduleManager.getInstalledModules();
            const modules = await pMapSeries(installedModules, async _module => {
                await channel.send(`Do you want to enable the ${_module.name} module?`);
                const enabled = await waitForBoolean(channel);
                await channel.send(`${enabled ? 'Enabled' : 'Disabled'} ${_module.name}!`);
                return {
                    ..._module,
                    enabled
                };
            });
            const enabledModules = modules
                .filter(_ => _.enabled)
                .filter(_ => !_.internal);

            // Only update DB if at least one module was enabled
            if (modules.length >= 1) {
                // Send message
                await channel.send(`Enabling ${enabledModules.length}/${installedModules.length} modules.`);

                // Enable modules
                await Promise.all(enabledModules.map(async _module => {
                    await database.query(sql`INSERT INTO modules (id, serverId, name, enabled) VALUES(${uuid()}, ${serverId}, ${_module.name}, ${true}) ON CONFLICT (serverId,name) DO UPDATE SET enabled = EXCLUDED.enabled;`);
                    await Promise.all(_module.commands.map(async command => {
                        await database.query(sql`INSERT INTO commands (id, serverId, command, enabled) VALUES(${uuid()}, ${serverId}, ${command.command}, ${true}) ON CONFLICT (serverId,command) DO UPDATE SET enabled = EXCLUDED.enabled;`);
                    }));
                }));
            }

            // Mark setup finished
            await database.query(sql`UPDATE servers SET setup=${true} WHERE id=${serverId}`);

            return 'Setup finished!';
        }
    }

    async handleCommands() {

    }

    async getRoles(role: string, channel: TextChannel | DMChannel) {
        // Ask the question
        await channel.send(`What roles do your ${role}s use?`);

        // Wait for the answer
        let roles = await waitForRoles(channel);

        // Get the role(s) mentioned
        if (!roles || roles.length === 0) {
            await channel.send('No role(s) mentioned, try again.');
            roles = await waitForRoles(channel);
        }

        // Didn't mention anyone even after a retry
        if (roles.length === 0) {
            await channel.send('No role(s) mentioned, skipping.');
            return;
        }

        // Remap to tags
        const tags = roles.map(role => `<@&${role}>`);

        // One role
        if (roles.length === 1) {
            await channel.send(`${tags[0]} has been marked as a "${role}" role!`);

            // Return roles
            return roles;
        }

        // Multiple roles
        await channel.send(`${tags.join(' ')} have all been marked a "${role}" roles!`);

        // Return roles
        return roles;
    }
};
