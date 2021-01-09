import { ApplicationCommandOptionType, Command } from '@/command';
import { Channel, GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import { AppError } from '@/errors';
import { AuditLog, Infraction } from '@/audit-log';

export class Kick extends Command {
    public name = 'Kick';
    public command = 'kick';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Kick a member.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['KICK_MEMBERS' as const];
    public roles = [];
    public options = [{
        name: 'member',
        description: 'User to kick',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'reason',
        description: 'Reason to kick the member',
        type: ApplicationCommandOptionType.STRING,
    }]

    // !kick @OmgImAlexis bad mod!
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Who are we?
        const member = message.member!;
        // Who are we kicking?
        const memberToKick = message.mentions.members?.first();
        // Why are we kicking them?
        const reason = args.slice(1).join(' ');
        return this.handler(message.channel, member, memberToKick, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we kicking?
        const memberToKick = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we kicking them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(interaction.channel, member, memberToKick, reason);
    }

    async handler(channel: Channel, moderator: GuildMember, memberToKick?: GuildMember, reason?: string) {
        // Make sure we have a memberToKick
        if (!memberToKick) {
            throw new AppError('Please mention a member to kick them.');
        }

        // Don't kick yourself
        if (moderator.id === memberToKick.id) {
            throw new AppError(`You can't kick yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for kicking <@%s>.', moderator.user.id);
        }

        try {
            // Create infraction
            const auditLog = new AuditLog(memberToKick.guild.id);
            const infraction = new Infraction({
                channelId: channel.id,
                moderatorId: moderator.id,
                userId: memberToKick.id,
                type: 'kick',
                reason,
                silent: false,
            });

            // Save infraction to DB
            await auditLog.addInfraction(infraction);

            // Send embed to audit log
            await auditLog.postAuditLogEmbeds();
            
            // Build embed before kicking member
            const embed = new MessageEmbed({
                description: `:rotating_light: **${memberToKick.user.username}#${memberToKick.user.discriminator}** was kicked! :rotating_light:`
            });

            // Kick member
            await memberToKick.kick(reason);

            // Send public embed to channel this was run in
            return embed;
        } catch (error) {
            console.log(error);
            throw new AppError('Failed kicking member: %s', error.message);
        }
    }
};