import { client } from '@/client';
import { isTextChannel } from '@/guards';
import { Server } from '@/servers';
import { Guild, MessageEmbed } from "discord.js";

const getGeneralChannel = (guild: Guild) => {
    // Look for a channel called general
    const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
    if (generalChannel) return generalChannel;
};

// Bot was added to a server
export const guildCreate = async (guild: Guild) => {
    const server = await Server.findOrCreate({ id: guild.id });
    const embed = new MessageEmbed({
        title: `${client.user?.username}`,
        color: 0xff8c69,
        fields: [{
            name: 'Welcome!',
            value: `Thanks for using <@${client.user?.id}>`
        }, {
            name: 'Get started!',
            value: `You can start by using \`${server.prefix}setup\``
        }, {
            name: 'Support',
            value: `https://discord.gg/F9EbdNF4T3`
        }],
        timestamp: new Date()
    });

    // Send message in the text channel
    const channel = getGeneralChannel(guild);
    if (channel && isTextChannel(channel)) {
        await channel.send(embed);
    }
};