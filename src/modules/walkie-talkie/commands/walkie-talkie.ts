import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { TextChannel } from 'discord.js';

const deleteWebhooks = async (client: Client, message: Message, webHookName: string) => {
    // Get our webhook
    const webhooks = await (message.channel as TextChannel).fetchWebhooks();
    const myWebhooks = webhooks.filter((webhook: any) => webhook.owner.id === client?.user?.id && webhook.name === 'WalkieTalkie');

    // Bail if we don't have any to delete
    if (myWebhooks.size === 0) return;

    for (let [id, webhook] of myWebhooks) await webhook.delete(`Requested by ${message.author.tag}`);
};

class WalkieTalkie implements Command {
    public name = 'walkie-talkie';

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
            if (client.settings.get(message.guild.id, 'walkieTalkie.enabled')) throw new CommandError('Walkie talkie is already enabled!');

            client.settings.set(message.guild.id, true, 'walkieTalkie.enabled');

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
            message.channel.send('Enabled walkie-talkie!');
        }

        // Disable channel
        if (['no', 'false', '0', 'disable', 'disabled', 'off'].includes(state)) {
            // Don't double disable it
            if (!client.settings.get(message.guild.id, 'walkieTalkie.enabled')) throw new CommandError('Walkie talkie is already disabled!');

            // Delete webhook
            await deleteWebhooks(client, message, 'WalkieTalkie');

            // Remove walkie talkie
            client.walkieTalkies.delete(message.guild.id);

            // Disable module in settings
            client.settings.set(message.guild.id, false, 'walkieTalkie.enabled');

            // Reply to user
            message.channel.send('Disabled walkie-talkie!');
        }
    }
};

export const walkieTalkie = new WalkieTalkie();