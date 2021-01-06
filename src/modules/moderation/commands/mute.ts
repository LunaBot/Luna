import parseDate from 'parse-human-date';
import { ApplicationCommandOptionType, Command } from '@/command';
import { AppError, CommandPermissionError } from '@/errors';
import { isTextChannelMessage } from '@/guards';
import { Server } from '@/servers';
import type { Message } from 'discord.js';

export class Mute extends Command {
    public name = 'Mute';
    public command = 'mute';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Mute a member.';
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
        description: 'Who to mute',
        type: ApplicationCommandOptionType.USER,
    }, {
        name: 'length',
        description: 'How long to mute the member for',
        type: ApplicationCommandOptionType.STRING,
    }, {
        name: 'type',
        description: 'Mute type? Hard/soft?',
        type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
        options: [{
            name: 'soft',
            description: 'Adds mute role',
            type: ApplicationCommandOptionType.SUB_COMMAND
        }, {
            name: 'hard',
            description: 'Adds mute role and strips ALL other roles',
            type: ApplicationCommandOptionType.SUB_COMMAND
        }]
    }];

    async messageHandler(prefix: string, message: Message, args: string[]) {
        return this.handler(prefix, message, args);
    }

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
                    mentionable: false,
                    // Put this to the top of the list so it can be found easy
                    hoist: true
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
            //        otherwise mutes over restarts don't work and we might
            //        unmute AFTER they've been manually unmuted and remuted
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
