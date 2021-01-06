import { ApplicationCommandOptionType, Command } from '@/command';
import { GuildChannel, GuildMember, Interaction, Message, MessageEmbed } from 'discord.js';
import { AppError } from '@/errors';
import { AuditLog, Infraction } from '@/audit-log';
import { isTextChannel } from '@/guards';
import { message } from 'git-rev-sync';

export class Warn extends Command {
    public name = 'Warn';
    public command = 'warn';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Warn a member.';
    public hidden = false;
    public owner = false;
    // @TODO Add in a way todo custom roles and such for servers
    public permissions = ['BAN_MEMBERS' as const];
    public options = [{
        name: 'member',
        required: true,
        description: 'User to warn',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'reason',
        description: 'Reason to warn the member',
        required: true,
        type: ApplicationCommandOptionType.STRING,
    }, {
        name: 'length',
        description: 'Warning length',
        type: ApplicationCommandOptionType.STRING,
    }]

    // !warn @OmgImAlexis bad mod!
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        if (isTextChannel(message.channel)) {
            // Where are we?
            const channel = message.channel;
            // Who are we?
            const member = message.guild!.members.cache.get(message.author.id!)!;
            // Who are we warning?
            const memberToWarn = message.mentions.members?.first();
            // Why are we warning them?
            const reason = args.slice(1).join(' ');

            // Remove warn message
            await message.delete();

            return this.handler(channel, member, memberToWarn, reason);
        }
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Where are we?
        const channel = interaction.channel;
        // Who are we?
        const member = interaction.member!;
        // Who are we warning?
        const memberToBan = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we warning them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(channel, member, memberToBan, reason);
    }

    async handler(channel: GuildChannel, moderator: GuildMember, memberToWarn?: GuildMember, reason?: string) {
        // Make sure we have a memberToBan
        if (!memberToWarn) {
            throw new AppError('Please mention a member to ban them.');
        }

        // Don't warn yourself
        if (moderator.id === memberToWarn.id) {
            // Give better warning to the 1%
            throw new AppError(Math.random() > 0.99 ? `You've been warned for warning yourself, ironic aye?` : `You can't warn yourself`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for banning <@%s>.', moderator.user.id);
        }

        try {
            // Warn member
            const auditLog = new AuditLog(channel.guild.id);
            const infraction = new Infraction({
                moderatorId: moderator.id,
                userId: memberToWarn.id,
                type: 'warn',
                reason,
                silent: false
            });

            // Save infraction to DB
            await auditLog.addInfraction(infraction);

            // Send embed to channel
            return new MessageEmbed({
                color: 16556627,
                timestamp: new Date(),
                author: {
                    name: `${moderator.displayName} (ID: ${moderator.id})`,
                    icon_url: moderator.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                description: `:warning: **Warned:**  <@!${memberToWarn.id}>\n:receipt: **Channel:** <#${channel.id}>\n:page_facing_up: **Reason:** ${reason}`,
                thumbnail: {
                    url: memberToWarn.user.displayAvatarURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                },
                footer: {
                    text: channel.guild.name,
                    icon_url: channel.guild.iconURL({ format: 'png' }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
                }
            });
        } catch (error) {
            return `Failed warning member: ${JSON.stringify(error, null, 2)}`;
        }
    }
};
