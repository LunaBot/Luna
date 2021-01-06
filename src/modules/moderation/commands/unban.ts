import { ApplicationCommandOptionType, Command } from '@/command';
import type { GuildMember, Interaction, Message } from 'discord.js';
import { AppError } from '@/errors';
import { getUserFromMention } from '@/utils';
import { client } from '@/client';

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
        const user = message.mentions.users?.first() || await getUserFromMention(args[0]);

        // Make sure we have a user
        if (!user) {
            throw new AppError('Please mention a user to unban them.');
        }

        // Why are we unbanning them?
        const reason = args.slice(1).join(' ');

        return this.handler(member, user.id, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we unbanning?
        // Make sure to fetch them as they may not be cached
        const userIdToUnban = await interaction.guild.members.fetch(interaction.options?.find(option => option.name === 'member')?.value!).then(_ => _.id);
        // Why are we unbanning them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(member, userIdToUnban, reason);
    }

    async handler(member: GuildMember, userIdToUnban?: GuildMember['id'], reason?: string) {
        // Make sure we have a userIdToUnban
        if (!userIdToUnban) {
            throw new AppError('No memberToBan provided!');
        }

        // Don't unban yourself
        if (member.id === userIdToUnban) {
            throw new AppError(`You can't unban yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for unbanning <@%s>.', userIdToUnban);
        }

        try {
            // Get user 
            const user = await client.users.fetch(userIdToUnban);

            // Unban user
            await member.guild.members.unban(user, reason);
            return `<@${member.user.id}> unbanned <@${user.id}> with reason "${reason}"`;
        } catch (error) {
            return `Failed unbanning member: ${JSON.stringify(error, null, 2)}`;
        }
    }
};
