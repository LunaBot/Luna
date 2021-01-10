import { ApplicationCommandOptionType, Command } from '@/command';
import { DMChannel, GuildMember, Interaction, Message, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { AppError } from '@/errors';
import { database } from '@/database';
import { sql } from '@databases/pg';
import { AuditLog, Infraction } from '@/audit-log';

export class Release extends Command {
    public name = 'Release';
    public command = 'release';
    public timeout = Command.TIMEOUTS.THIRTY_SECONDS;
    public description = 'Release a member from jail.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['MANAGE_ROLES' as const, 'KICK_MEMBERS' as const];
    public roles = [
        // Symbol.for('@mod'),
        // Symbol.for('@admin'),
    ];
    public options = [{
        name: 'member',
        description: 'User to release from jail',
        type: ApplicationCommandOptionType.USER,
    }];

    // !release @OmgImAlexis
    async messageHandler(_prefix: string, message: Message, _args: string[]) {
        // Delete the message
        await message.delete();

        // Who are we?
        const member = message.member!;
        // Who are we releasing?
        const memberToRelease = message.mentions.members?.first();
        return this.handler(message.channel, member, memberToRelease);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we releasing?
        const memberToRelease = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);

        return this.handler(interaction.channel, member, memberToRelease);
    }

    async handler(channel: TextChannel | DMChannel | NewsChannel, moderator: GuildMember, memberToRelease?: GuildMember) {
        // Make sure we have a memberToRelease
        if (!memberToRelease) {
            throw new AppError('Please mention a member to release them.');
        }

        try {
            // Get jailed role
            const jailedRole = moderator.guild.roles.cache.find(role => role.name.toLowerCase() === 'jailed')!;

            // Is member jailed?
            if (!memberToRelease.roles.cache.find(role => role.name.toLowerCase() === 'jailed')) {
                throw new AppError(`**${memberToRelease.user.username}#${memberToRelease.user.discriminator}** isn't in jail?`);
            }

            // Get roles
            const query = sql`SELECT removedRoles FROM auditlog WHERE serverId=${moderator.guild.id} AND type=${'jail'} AND removedRoles IS NOT NULL ORDER BY createdAt DESC LIMIT 1`;
            const rolesToAdd = await database.query<{ removedroles: string[] }>(query).then(rows => {
                return rows[0].removedroles;
            });

            // Create infraction
            const auditLog = new AuditLog(memberToRelease.guild.id);
            const infraction = new Infraction({
                channelId: channel.id,
                moderatorId: moderator.id,
                userId: memberToRelease.id,
                type: 'release',
            });

            // Save infraction to DB
            await auditLog.addInfraction(infraction);

            // Add roles
            await Promise.all(rolesToAdd.map(async (roleId) => {
                await memberToRelease.roles.add(roleId);
            }));

            // Remove jailed role
            await memberToRelease.roles.remove(jailedRole);

            // Send embed to audit log
            await auditLog.postAuditLogEmbeds();

            // Send embed to channel
            return new MessageEmbed({
                description: `:rotating_light: **${memberToRelease.user.username}#${memberToRelease.user.discriminator}** was released from jail! :rotating_light:`
            });
        } catch (error) {
            throw new AppError('Failed releasing member: %s', error.message);
        }
    }
};