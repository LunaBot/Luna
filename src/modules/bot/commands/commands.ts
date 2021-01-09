import { Menu } from 'discord.js-menu';
import joinUrl from 'url-join';
import { Channel, Interaction, Message, MessageEmbed, User } from 'discord.js';
import { Command } from '@/command';
import { Server } from '@/servers';
import { moduleManager } from '@/module-manager';
import dedent from 'dedent';
import { isTextChannelMessage } from '@/guards';
import { config } from '@/config';

interface Field {
    name: string;
    value: string;
    inline: boolean;
};

export class Commands extends Command {
    public name = 'Commands';
    public command = 'commands';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Print all commands you have access to.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = [];

    async messageHandler(_prefix: string, message: Message, _args: string[]) {
        if (isTextChannelMessage(message)) {
            return this.handler({}, message.guild.id, message.channel, message.author!);
        }
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler({}, interaction.guild.id, interaction.channel, interaction.author!);
    }

    async handler({}, serverId: string, channel: Channel, user: User) {
        // Get all enabled commands
        const commands = await moduleManager.getEnabledCommands(serverId);

        // Create embeds
        const server = await Server.findOrCreate({ id: serverId });
        const fields = commands.map(command => {
            return {
                name: command.name,
                value: dedent`
                    Command: ${`\`${server.prefix ?? '!'}${command.command}\``}
                    Description: ${command.description}
                    ${command.options.length >= 1 ? `Options: ${command.options.map(option => `\`${option.name}\``).join(', ')}`: ''}
                `,
                inline: false
            };
        });
        
        const createPages = (fields: Field[]) => {
            const chunk = (array: any[], sizeOfChunk: number): any[][] => {
                if (!array.length) return [];
                return [array.slice(0, sizeOfChunk)].concat(chunk(array.slice(sizeOfChunk), sizeOfChunk) );
            };
            const pages = chunk(fields, 10);
            return pages.map((fields, index) => ({
                /*
                 * A page object consists of three items:
                 * 1) A name. This is used as a unique destination name for reactions.
                 * 2) Some content. This is a rich embed. 
                 * You can use {object: formatting} or .functionFormatting() for embeds. Whichever you prefer.
                 * 3) A set of reactions, linked to either a page destination or a function.* (See example pages)
                 * 
                 * Reactions can be emojis or custom emote IDs, and reaction destinations can be either the names
                 * of pages, () => { functions }, or special destination names. See below for a list of these.
                 */

                /* You can call pages whatever you like. The first in the array is always loaded first. */
                name: 'main',
                content: new MessageEmbed({
                    title: 'Commands',
                    url: joinUrl(config.PUBLIC_URL, 'wiki', 'commands'),
                    fields,
                    ...(pages.length >= 2 ? {
                        footer: {
                            text: `Page ${index + 1}/${pages.length}`
                        }
                    } : {})
                }),
                ...(pages.length >= 2 ? {
                    reactions: {
                        '⬅️': 'previous',
                        '➡️': 'next'
                    }
                } : {})
            }));
        }

         /*
         * The menu class takes 4 parameters. 
         * 1) A channel to send the menu to
         * 2) A user ID to give control over the navigation, 
         * 3) An array of Page objects, each being a unique page of the menu
         * 4) How long, in milliseconds, you want the menu to wait for new reactions
         */
        let helpMenu = new Menu(channel, user.id, createPages(fields), 300000)

        /* Run Menu.start() when you're ready to send the menu in chat.
         * Once sent, the menu will automatically handle everything else.
         */ 
        helpMenu.start();

        // No command output
        return Symbol.for('silent');
    }
};
