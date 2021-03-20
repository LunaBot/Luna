import { Command } from '@lunabot/kaspar';
import type { Message, Client, TextChannel } from 'discord.js';
import { colours, isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection, MessageEmbed } from 'discord.js';
import dedent from 'dedent';

const deleteWebhook = async (client: Client, message: Message, webHookId?: string) => {
    // Bail if empty
    if (!webHookId) return;
    
    // Get our webhook
    const webhooks = await (message.channel as TextChannel).fetchWebhooks();
    const myWebhook = webhooks.filter((webhook: any) => webhook.owner.id === client?.user?.id && webHookId === webhook.id);

    // Delete webhook
    myWebhook.delete(`Requested by ${message.author.tag}`);
};

class WalkieTalkie extends Command {
    public paramaters = new Collection(Object.entries({
        enabled: {
            type: 'boolean' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        // Enable channel
        const state = args[0];
        if (['yes', 'true', '1', 'enable', 'enabled', 'on'].includes(state)) {
            // Don't double enable it
            if (client.settings.get(message.guild.id, 'walkieTalkie.channel') !== '') throw new CommandError('Walkie talkie is already enabled!');

            // Create webhook
            const webhook = await (message.channel as TextChannel).createWebhook('WalkieTalkie', {
                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
            });

            // Created webhook
            client.logger.debug(`Created webhook ${webhook.id}`);

            // Set channel id and webhook id/token
            client.settings.set(message.guild.id, message.channel.id, 'walkieTalkie.channel');
            client.walkieTalkies.set(message.guild.id, webhook.id, 'id');
            client.walkieTalkies.set(message.guild.id, webhook.token, 'token');

            // Reply to user
            await message.reply(new MessageEmbed({
                author: {
                    name: 'WalkieTalkie'
                },
                color: colours.GREEN,
                description: 'Enabled walkie-talkie!'
            }));
        }

        // Disable channel
        if (['no', 'false', '0', 'disable', 'disabled', 'off'].includes(state)) {
            // Don't double disable it
            if (!client.settings.get(message.guild.id, 'walkieTalkie.enabled')) throw new CommandError('Walkie talkie is already disabled!');

            // Delete webhook
            await deleteWebhook(client, message, client.walkieTalkies.get(message.guild.id)?.id).catch(() => {});

            // Remove walkie talkie
            client.walkieTalkies.delete(message.guild.id);

            // Clear channel and webhook
            client.settings.set(message.guild.id, '', 'walkieTalkie.channel');
            client.walkieTalkies.set(message.guild.id, '', 'id');
            client.walkieTalkies.set(message.guild.id, '', 'token');

            // Reply to user
            await message.reply(new MessageEmbed({
                author: {
                    name: 'WalkieTalkie'
                },
                color: colours.YELLOW,
                description: 'Disabled walkie-talkie!'
            }));
        }

        // Status command
        if (state === 'status') {
            const channel = client.settings.get(message.guild.id, 'walkieTalkie.channel');
            const description = dedent`
                **Status**: ${channel !== '' ? 'on' : 'off'}
                **Channel**: ${channel ? ('<#' + channel + '>') : 'Not set'}
            `;
            await message.reply(new MessageEmbed({
                author: {
                    name: 'WalkieTalkie'
                },
                color: colours.RED,
                description
            }));
        }
    }
};

export const walkieTalkie = new WalkieTalkie();