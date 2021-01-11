import { String, Record, Static, Partial, Literal, Boolean, Union, Array } from 'runtypes';
import { Server } from '@/servers';
import { database } from './database';
import { sql } from '@databases/pg';
import { v4 as uuid } from 'uuid';
import { User } from './user';
import { Channel, GuildMember, MessageEmbed } from 'discord.js';
import { client } from './client';
import { isTextChannel } from './guards';

export const InfractionType = Union(
    Literal('warn'),
    Literal('ban'),
    Literal('unban'),
    Literal('kick'),
    Literal('jail'),
    Literal('release'),
);

const InfractionOptions = Record({
    channelId: String,
    userId: String,
    moderatorId: String,
    type: InfractionType,
}).And(Partial({
    id: String,
    silent: Boolean,
    removedRoles: Array(String),
    reason: String,
}));

export class AuditLog {
    public serverId: Server['id'];
    public infractions: Infraction[];

    constructor(serverId: Server['id']) {
        this.serverId = serverId;
        this.infractions = [];
    }

    /**
     * Add an infraction to the audit log.
     * @param infraction The infraction
     * @param save Should the infraction be persisted to the DB
     */
    public async addInfraction(infraction: Infraction, save = true) {
        const serverId = this.serverId;
        const id = infraction.id ?? uuid();
        const type = infraction.type;
        const silent = infraction.silent;
        const moderatorId = infraction.moderatorId;
        const userId = infraction.userId;
        const removedRoles = infraction.removedRoles;
        if (save) {
            const query = sql`INSERT INTO auditLog(id,serverId,type,silent,moderatorId,userId,removedRoles) VALUES (${id},${serverId},${type},${silent},${moderatorId},${userId},${removedRoles})`;
            await database.query(query);
        }

        // Only push if not saving or if save was successful
        this.infractions.push(infraction);
    }

    /**
     * Post all the embeds for infractions to their appropriate audit log channels.
     * This will only get ones you've added since the creation of the AuditLog class.
     * E.g. const auditLog = new AuditLog(); 
     *      const infraction = new Infraction();
     *      auditLog.addInfraction(infraction);
     *      return auditLog.getEmbeds();
     */
    public async postAuditLogEmbeds() {
        const guild = client.guilds.cache.get(this.serverId);
        // Warn -> Jail/Mute -> Kick -> Ban
        // Release/UnMute -> Unban
        const infractionType = {
            warn: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({

            }),
            jail: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({
                color: 16556627,
                timestamp: new Date(),
                author: {
                    name: `${moderator.displayName} (ID: ${moderator.id})`,
                    icon_url: moderator.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                description: `:rotating_light: **Jailed:**  <@!${member.id}>\n:receipt: **Channel:** <#${channel.id}>\n:page_facing_up: **Reason:** ${reason}`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                }
            }),
            kick: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({
                color: 16556627,
                timestamp: new Date(),
                author: {
                    name: `${moderator.displayName} (ID: ${moderator.id})`,
                    icon_url: moderator.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                description: `:rotating_light: **Kicked:**  <@!${member.id}>\n:receipt: **Channel:** <#${channel.id}>`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                }
            }),
            ban: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({
                color: 16556627,
                timestamp: new Date(),
                author: {
                    name: `${moderator.displayName} (ID: ${moderator.id})`,
                    icon_url: moderator.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                description: `:rotating_light: **Banned:**  <@!${member.id}>\n:receipt: **Channel:** <#${channel.id}>`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                }
            }),
            release: (channel: Channel, member: GuildMember, moderator: GuildMember, _reason: string) => new MessageEmbed({
                color: 16556627,
                timestamp: new Date(),
                author: {
                    name: `${moderator.displayName} (ID: ${moderator.id})`,
                    icon_url: moderator.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                description: `:rotating_light: **Released:**  <@!${member.id}>\n:receipt: **Channel:** <#${channel.id}>`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                footer: {
                    text: member.guild.name,
                    icon_url: member.guild.iconURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                }
            }),
            unmute: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({

            }),
            unban: (channel: Channel, member: GuildMember, moderator: GuildMember, reason: string) => new MessageEmbed({

            }),
        };
        return Promise.all(this.infractions.map(async infraction => {
            const channel = guild?.channels.cache.get(infraction.channelId)!;
            const member = (guild?.members.cache.get(infraction.userId) ?? await guild?.members.fetch(infraction.userId))!;
            const moderator = guild?.members.cache.get(infraction.moderatorId)!;
            const reason = infraction.reason;
            const type = infraction.type;
            const auditLogQuery = sql`SELECT channelIds from auditLogs WHERE serverId=${this.serverId} AND (type=${type} OR type=${'*'})`;
            console.log(`SELECT channelIds from auditLogs WHERE serverId=${this.serverId} AND (type=${type} OR type=${'*'})`);
            const auditLogChannelIds = await database.query<{ channelids: string[] }>(auditLogQuery).then(rows => rows.flatMap(row => row.channelids));
            const auditLogChannels = auditLogChannelIds.map(auditLogChannelId => guild?.channels.cache.get(auditLogChannelId));
            const embed = infractionType[type](channel, member, moderator, reason);

            // Post the embed in each channel
            await Promise.all(auditLogChannels.map(async auditLogChannel => {
                if (isTextChannel(auditLogChannel)) {
                    // Send the embed
                    await auditLogChannel.send(embed);
                }
            }));
        }));
    }
};

export class Infraction {
    public channelId: string;
    public userId: User['id'];
    public moderatorId: string;
    public type: Static<typeof InfractionType>;
    public reason: string;
    public silent: boolean;
    public id: string;
    public removedRoles: string[];

    constructor(options: Static<typeof InfractionOptions>) {
        // Ensure options are correct
        InfractionOptions.check(options);

        // Add options into class
        this.channelId = options.channelId;
        this.userId = options.userId;
        this.moderatorId = options.moderatorId;
        this.type = options.type;
        this.reason = options.reason || 'No reason given.';
        this.silent = options.silent || false;
        this.id = options.id || uuid();
        this.removedRoles = options.removedRoles || [];
    }
};