import { client } from '@/client';
import { database } from '@/database';
import { envs } from '@/envs';
import { Server } from '@/servers';
import { sql } from '@databases/pg';
import { Guild, MessageEmbed } from 'discord.js';
import { v4 as uuid } from 'uuid';
import Long from 'long';
import { isTextChannel } from '@/guards';
import humanizeDuration from 'humanize-duration';

// Borrowed from https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/frequently-asked-questions.md#default-channel
const getDefaultChannel = (guild: Guild) => {
    // Get "original" default channel
    if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);

    // Check for a "general" channel, which is often default chat
    const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
    if (generalChannel) return generalChannel;

    // Get the first channel where the bot can send messages
    const bot = guild.client.user!;
    return guild.channels.cache
        .filter(channel => channel.type === 'text' && channel.permissionsFor(bot)?.has('SEND_MESSAGES') === true)
        .sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
        .first();
}

// Bot was added to a server
export const guildCreate = async (guild: Guild) => {
    const server = await Server.findOrCreate({ id: guild.id });

    // Mark in the DB that we just added the bot
    await server.botAdded();

    // DM bot owner
    const owner = await client.users.fetch(envs.OWNER.ID);
    await owner?.send(`${guild.id} aka "${guild.name}" just added me. :slight_smile:`);

    // Set bot's activity status
    const serversCount = await database.query<{ count: number }>(sql`SELECT COUNT(id) FROM servers;`).then(rows => rows[0].count);
    await client.user?.setActivity({
        name: `over ${serversCount} server${serversCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

    // Enable the "setup", "help", "commands" and "bot" commands
    await database.query(sql`
        INSERT INTO commands
            (id, serverId, command, enabled, allowedRoles, deniedRoles)
        VALUES
            (${uuid()},${guild.id},${'setup'},${true},${[]},${[]}),
            (${uuid()},${guild.id},${'help'},${true},${['*']},${[]}),
            (${uuid()},${guild.id},${'commands'},${true},${['*']},${[]}),
            (${uuid()},${guild.id},${'bot'},${true},${['*']},${[]})
        ON CONFLICT (serverId,command)
        DO UPDATE SET enabled = EXCLUDED.enabled;
    `);

    const plan = await database.query<{ type: 'free' | 'premium' | 'platinum', endtimestamp: number }>(sql`
        SELECT type, endTimestamp FROM memberships WHERE serverId=${server.id}
    `).then(rows => ({
        type: rows[0].type,
        expiration: rows[0].endtimestamp - (new Date().getTime())
    }));

    // Create welcome embed
    const embed = new MessageEmbed({
        title: `${client.user?.username}`,
        color: 0xff8c69,
        fields: [{
            name: 'Welcome!',
            value: `Thanks for using <@${client.user?.id}>, you currently have a ${plan.type} plan which expires in ${humanizeDuration(plan.expiration, { largest: 1 })}`
        }, {
            name: 'Get started!',
            value: `You can start by using \`${server.prefix}setup\``
        }, {
            name: 'Already setup?',
            value: 'Visit the dashboard https://automod.gg/dashboard'
        }, {
            name: 'Need support?',
            value: `Join our support server https://discord.gg/F9EbdNF4T3`
        }],
        timestamp: new Date()
    });

    // Send message in the text channel
    const channel = getDefaultChannel(guild);
    if (channel && isTextChannel(channel)) {
        await channel.send(embed);
    }
};