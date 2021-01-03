import { ApplicationCommandOptionType, Command } from '@/command';
import type { GuildMember, Interaction, Message } from 'discord.js';
import { AppError } from '@/errors';

export class Kick extends Command {
    public name = 'Kick';
    public command = 'kick';
    public timeout = 5000;
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
        return this.handler(member, memberToKick, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we kicking?
        const memberToKick = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we kicking them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(member, memberToKick, reason);
    }

    async handler(member: GuildMember, memberToKick?: GuildMember, reason?: string) {
        // Make sure we have a memberToKick
        if (!memberToKick) {
            throw new AppError('Please mention a member to kick them.');
        }

        // Don't kick yourself
        if (member.id === memberToKick.id) {
            throw new AppError(`You can't kick yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for kicking <@%s>.', member.user.id);
        }

        try {
            // Kick member
            await memberToKick.kick(reason);
            return `<@${member.user.id}> kicked <@${memberToKick.user.id}> with reason "${reason}"`
        } catch (error) {
            return `Failed kicking member: ${JSON.stringify(error, null, 2)}`;
        }
    }
};