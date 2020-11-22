import { MessageEmbed } from 'discord.js'

export const member = (prefix: string) => {
    return new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setAuthor('@automod')
        .addFields({
            name: 'Moderator',
            value: `\`${prefix}help moderator\``
        }, {
            name: 'Member',
            value: `\`${prefix}help member\``
        });
};
