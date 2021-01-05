import { ApplicationCommandOptionType, Command } from '@/command';
import type { GuildMember, Interaction, Message } from 'discord.js';
import { AppError } from '@/errors';

export class Unban extends Command {
    public name = 'Unban';
    public command = 'unban';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Unban a member.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = ['BAN_MEMBERS' as const];
    public roles = [];
    public options = [{
        name: 'member',
        description: 'User to Unban',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'reason',
        description: 'Reason to unban the member',
        type: ApplicationCommandOptionType.STRING,
    }]

    // !unban @OmgImAlexis didn't mean to ban you!
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Who are we?
        const member = message.member!;
        // Who are we unbanning?
        const memberToUnban = message.mentions.members?.first();
        // Why are we unbanning them?
        const reason = args.slice(1).join(' ');
        return this.handler(member, memberToUnban, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we unbanning?
        const memberToUnban = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we unbanning them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(member, memberToUnban, reason);
    }

    async handler(member: GuildMember, memberToUnban?: GuildMember, reason?: string) {
        // Make sure we have a memberToUnban
        if (!memberToUnban) {
            throw new AppError('Please mention a member to unban them.');
        }

        // Don't unban yourself
        if (member.id === memberToUnban.id) {
            throw new AppError(`You can't unban yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for unbanning <@%s>.', member.user.id);
        }

        try {
            // Unban member
            await member.guild.members.unban(memberToUnban.id, reason);
            return `<@${member.user.id}> unbanned <@${memberToUnban.user.id}> with reason "${reason}"`
        } catch (error) {
            return `Failed unbanning member: ${JSON.stringify(error, null, 2)}`;
        }
    }
};
