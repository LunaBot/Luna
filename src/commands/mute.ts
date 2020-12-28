import parseDate from 'parse-human-date';
import type { Message } from 'discord.js';
import { Command } from '../command';
import { isTextChannelMessage } from '../guards';
import { Server } from '../servers';
import { AppError, CommandPermissionError } from '../errors';

class Mute extends Command {
    public name = 'mute';
    public command = 'mute';
    public timeout = 5000;
    public description = 'Mute a member.';
    public hidden = true;
    public owner = false;
    public examples = [
        '!mute @OmgImAlexis 1 minute',
        '!mute @OmgImAlexis 5 hours',
        '!mute @OmgImAlexis 10 days',
    ];
    public roles = [ '@server-mod' ];

    async handler(_prefix: string, message: Message, args: string[]) {
        if (isTextChannelMessage(message)) {
            const server = await Server.findOrCreate({ id: message.guild.id });

            // Only allow mods to do this
            if (!message.member?.hasPermission('MANAGE_ROLES')) {
                throw new CommandPermissionError(server.prefix, 'mute');
            }

            // Ensure we include how long we want the mute for
            const [ _, ...date ] = args;
            const muteUntil = parseDate(date.join(' '));
            if (!muteUntil) {
                throw new AppError(`You need to include a mute length like \`${server.prefix}mute @OmgImAlexis 1 minute\``);
            }

            const member = message.mentions.members?.first();
            const memberRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'member');
            const muteRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'muted') ?? await message.guild.roles.create({
                data: {
                    name: 'Muted',
                    mentionable: false
                }
            });

            // Remove existing role
            if (memberRole) {
                await member?.roles.remove(memberRole);
            }

            // Add "muted" role
            await member?.roles.add(muteRole);

            // Later on unmute them
            // @TODO: This needs to mark the mute in the database
            //        otherwise mutes over restarts don't work
            const timeout = new Date(muteUntil).getTime() - new Date().getTime();
            setTimeout(async () => {
                await member?.roles.remove(muteRole);
                if (memberRole) {
                    await member?.roles.add(memberRole);
                }

                message.channel.send(`Unmuted <@${member?.user.id}>`);
            }, timeout);

            return `Muted <@${member?.user.id}> until ${muteUntil}`;
        }

        throw new AppError('Invalid channel type!');
    }
};

export default new Mute();
