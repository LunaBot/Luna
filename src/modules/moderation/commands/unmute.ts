import parseDate from 'parse-human-date';
import { ApplicationCommandOptionType, Command } from '@/command';
import { AppError, CommandPermissionError } from '@/errors';
import { isTextChannelMessage } from '@/guards';
import { Server } from '@/servers';
import type { Message } from 'discord.js';

export class Unmute extends Command {
    public name = 'Unmute';
    public command = 'unmute';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Unmute a member.';
    public hidden = true;
    public owner = false;
    public examples = [
        '!mute @OmgImAlexis 1 minute',
        '!mute @OmgImAlexis 5 hours',
        '!mute @OmgImAlexis 10 days',
    ];
    public permissions = ['MUTE_MEMBERS' as const];
    public options = [{
        name: 'member',
        description: 'Who to unmute',
        type: ApplicationCommandOptionType.USER,
    }];

    async messageHandler(prefix: string, message: Message, args: string[]) {
        if (isTextChannelMessage(message)) {
            return this.handler(prefix, message, args);
        }

        throw new AppError('Invalid channel type!');
    }

    // @TODO: This needs to mark the unmute in the database
    async handler(_prefix: string, message: Message, args: string[]) {
        const server = await Server.findOrCreate({ id: message.guild!.id });

        // Only allow mods to do this
        // @TODO: Maybe tie this into the MUTE_MEMBERS permission?
        if (!message.member?.hasPermission('MANAGE_ROLES')) {
            throw new CommandPermissionError(server.prefix, 'mute');
        }

        const member = message.mentions.members?.first();
        const memberRole = message.guild!.roles.cache.find(role => role.name.toLowerCase() === 'member');
        const muteRole = message.guild!.roles.cache.find(role => role.name.toLowerCase() === 'muted') ?? await message.guild!.roles.create({
            data: {
                name: 'Muted',
                mentionable: false
            }
        });

        // Remove mute role
        if (muteRole) {
            await member?.roles.remove(muteRole);
        }

        // Add "member" role back
        if (memberRole) {
            await member?.roles.add(memberRole);
        }

        // Let user know they're unmuted
        await message.channel.send(`Unmuted <@${member?.user.id}>`);
    }
};
