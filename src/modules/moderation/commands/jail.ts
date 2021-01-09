import { ApplicationCommandOptionType, Command } from '@/command';
import { DMChannel, GuildMember, Interaction, Message, MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { AppError } from '@/errors';
import { AuditLog, Infraction } from '@/audit-log';

export class Jail extends Command {
    public name = 'Jail';
    public command = 'jail';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Jail a member.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['MANAGE_ROLES' as const, 'KICK_MEMBERS' as const];
    public options = [{
        name: 'member',
        description: 'User to jail',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'reason',
        description: 'Reason to jail the member',
        type: ApplicationCommandOptionType.STRING,
    }];

    // !jail @OmgImAlexis
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Delete the message
        await message.delete();

        // Who are we?
        const member = message.member!;
        // Who are we jailing?
        const memberToJail = message.mentions.members?.first();
        // Why are we jailing them?
        const reason = args.slice(1).join(' ');
        return this.handler(message.channel, member, memberToJail, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we jailing?
        const memberToJail = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we jailing them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(interaction.channel, member, memberToJail, reason);
    }

    async handler(channel: TextChannel | DMChannel | NewsChannel, moderator: GuildMember, memberToJail?: GuildMember, reason?: string) {
        // Make sure we have a memberToJail
        if (!memberToJail) {
            throw new AppError('Please mention a member to jail them.');
        }

        // Don't jail yourself
        if (moderator.id === memberToJail.id) {
            throw new AppError(`You can't jail yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for jailing <@%s>.', memberToJail.user.id);
        }

        try {
            // Get roles
            const removedRoles = memberToJail.roles.cache.filter(role => role.name !== '@everyone').map(role => role.id);

            // Is member already jailed?
            if (memberToJail.roles.cache.find(role => role.name.toLowerCase() === 'jailed')) {
                throw new AppError(`**${memberToJail.user.username}#${memberToJail.user.discriminator}** is already jailed?`);
            }

            // Create infraction
            const auditLog = new AuditLog(memberToJail.guild.id);
            const infraction = new Infraction({
                channelId: channel.id,
                moderatorId: moderator.id,
                userId: memberToJail.id,
                type: 'jail',
                reason,
                silent: false,
                removedRoles,
            });

            // Save infraction to DB
            await auditLog.addInfraction(infraction);

            // Get jailed role
            const jailedRole = moderator.guild.roles.cache.find(role => role.name.toLowerCase() === 'jailed') ?? await moderator.guild.roles.create({
                data: {
                    name: 'Jailed',
                    mentionable: false,
                    // Put this to the top of the list so it can be found easy
                    hoist: true
                }
            });

            // Give jailed role
            await memberToJail.roles.add(jailedRole);

            // Remove roles
            await Promise.all(removedRoles.map(async (roleId) => {
                await memberToJail.roles.remove(roleId);
            }));

            // Send embed to audit log
            await auditLog.postAuditLogEmbeds();

            // Send public embed to channel this was run in
            return new MessageEmbed({
                description: `:rotating_light: **${memberToJail.user.username}#${memberToJail.user.discriminator}** has been jailed! :rotating_light:`
            });
        } catch (error) {
            throw new AppError('Failed jailing member: %s', error.message);
        }
    }
};