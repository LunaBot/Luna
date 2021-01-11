import { ApplicationCommandOptionType, Command } from '@/command';
import { Channel, GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import { AppError } from '@/errors';
import { AuditLog, Infraction } from '@/audit-log';
import { sleep } from '@/utils';
import { isTextChannel } from '@/guards';

export class Ban extends Command {
    public name = 'Ban';
    public command = 'ban';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Ban a member.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['BAN_MEMBERS' as const];
    public roles = [];
    public options = [{
        name: 'member',
        description: 'User to Ban',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'days',
        description: 'Ban length in days',
        type: ApplicationCommandOptionType.INTEGER,
    }, {
        name: 'reason',
        description: 'Reason to ban the member',
        type: ApplicationCommandOptionType.STRING,
    }]

    // !ban @OmgImAlexis bad mod!
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Who are we?
        const member = message.member!;
        // Who are we banning?
        const memberToBan = message.mentions.members?.first();
        // For how long?
        const days = Number(args.slice(1));
        // Why are we banning them?
        const reason = args.slice(2).join(' ');
        return this.handler(message.channel, member, memberToBan, days, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we banning?
        const memberToBan = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we banning them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;
        // For how long?
        const days = Number(interaction.options?.find(option => option.name === 'days')?.value);
        return this.handler(interaction.channel, member, memberToBan, days, reason);
    }

    async handler(channel: Channel, moderator: GuildMember, memberToBan?: GuildMember, days?: number, reason?: string) {
        // Make sure we have a memberToBan
         if (!memberToBan) {
            throw new AppError('Please mention a member to ban them.');
        }

        // Don't ban yourself
        if (moderator.id === memberToBan.id) {
            throw new AppError(`You can't ban yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for banning <@%s>.', moderator.user.id);
        }

        try {
            // Create infraction
            const auditLog = new AuditLog(memberToBan.guild.id);
            const infraction = new Infraction({
                channelId: channel.id,
                moderatorId: moderator.id,
                userId: memberToBan.id,
                type: 'ban',
                reason,
                silent: false,
            });

            // Save infraction to DB
            await auditLog.addInfraction(infraction);

            // Send embed to audit log
            await auditLog.postAuditLogEmbeds();
            
            // Build embed before banning member
            const embed = new MessageEmbed({
                description: `:rotating_light: **${memberToBan.user.username}#${memberToBan.user.discriminator}** was banned! :rotating_light:`
            });

            // Send public embed to channel this was run in
            if (isTextChannel(channel)) {
                await channel.send(embed);
            }

            // Ban member
            await memberToBan.ban({
                days,
                reason
            });

            // Silent response
            return Symbol.for('silent');
        } catch (error) {
            console.log(error);
            throw new AppError('Failed banning member: %s', error.message);
        }
    }
};
