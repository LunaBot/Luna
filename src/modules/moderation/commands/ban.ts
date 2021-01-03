import { ApplicationCommandOptionType, Command } from '@/command';
import type { GuildMember, Interaction, Message } from 'discord.js';
import { AppError } from '@/errors';

export class Ban extends Command {
    public name = 'Ban';
    public command = 'ban';
    public timeout = 5000;
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
        name: 'reason',
        description: 'Reason to ban the member',
        type: ApplicationCommandOptionType.STRING,
    }, {
        name: 'length',
        description: 'Ban length',
        type: ApplicationCommandOptionType.STRING,
    }]

    // !ban @OmgImAlexis bad mod!
    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Who are we?
        const member = message.member!;
        // Who are we banning?
        const memberToBan = message.mentions.members?.first();
        // Why are we banning them?
        const reason = args.slice(1).join(' ');
        return this.handler(member, memberToBan, reason);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        // Who are we?
        const member = interaction.member!;
        // Who are we banning?
        const memberToBan = interaction.guild.members.cache.get(interaction.options?.find(option => option.name === 'member')?.value!);
        // Why are we banning them?
        const reason = interaction.options?.find(option => option.name === 'reason')?.value;

        return this.handler(member, memberToBan, reason);
    }

    async handler(member: GuildMember, memberToBan?: GuildMember, reason?: string) {
        // Make sure we have a memberToBan
        if (!memberToBan) {
            throw new AppError('Please mention a member to ban them.');
        }

        // Don't ban yourself
        if (member.id === memberToBan.id) {
            throw new AppError(`You can't ban yourself.`);
        }

        // Make sure we give a reason
        if (!reason) {
            throw new AppError('Please include a reason for banning <@%s>.', member.user.id);
        }

        try {
            // Ban member
            await memberToBan.ban({
                reason
            });
            return `<@${member.user.id}> banned <@${memberToBan.user.id}> with reason "${reason}"`
        } catch (error) {
            return `Failed banning member: ${JSON.stringify(error, null, 2)}`;
        }
    }
};
