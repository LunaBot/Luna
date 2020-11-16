import { MessageEmbed, Message } from 'discord.js';
import { InvalidCommandError } from '../errors';
import { getStore } from '../store';

const generateHelp = () => {
    const store = getStore('default');
    return new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setAuthor('@automod')
        .addFields({
            name: 'Moderator',
            value: `\`${store.prefix}help moderator\``
        }, {
            name: 'Member',
            value: `\`${store.prefix}help member\``
        });
};

const generateMemberHelp = () => {
    const store = getStore('default');
    return new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setAuthor('@automod')
        .addFields({
            name: 'Moderator',
            value: `\`${store.prefix}help moderator\``
        }, {
            name: 'Member',
            value: `\`${store.prefix}help member\``
        });
};

const generateModHelp = () => {
    return new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setAuthor('Moderator Plugin')
        .addFields({
            name: '`!ban [member] (optional reason)`',
            value: 'Bans a member from the server'
        }, {
            name: '`!tempban [member] [duration] (optional reason)`',
            value: 'Temporarily bans a member from the server'
        }, {
            name: '`!clear (optional member) (optional count)`',
            value: 'Clears messages in a particular channel'
        }, {
            name: '`!clear-all-infractions`',
            value: 'Remove all the infractions of everyone in the server'
        }, {
            name: '`!infractions [member]`',
            value: 'Displays how many infractions this member has'
        }, {
            name: '`!kick [member] (optional reason)`',
            value: 'Kicks a member from the server'
        }, {
            name: '`!mute [member] (optional reason)`',
            value: 'Mutes a member in the whole server'
        }, {
            name: '`!tempmute [member] [duration] (optional reason)`',
            value: 'Temporarily mutes a member in the server'
        }, {
            name: '`!role-info [role]`',
            value: 'Gets information about a role'
        }, {
            name: '`!server-info`',
            value: 'Gets information about your server'
        }, {
            name: '`!slowmode (optional timeout) (optional off)`',
            value: 'Enables/Disables slowmode in a channel'
        }, {
            name: '`!unban [member]`',
            value: 'Unbans a member'
        }, {
            name: '`!unmute [member]`',
            value: 'Unmutes a member'
        }, {
            name: '`!user-info (optional member)`',
            value: 'Gets information about a user'
        }, {
            name: '`!warn [member] (optional reason)`',
            value: 'Warns a member'
        });
};

export default {
    name: 'help',
    command: 'help',
    description: 'Show help',
    roles: [
        '@everyone'
    ],
    async handler(message: Message, args: string[]) {
        const role = args[0];
        if (!role) {
            return generateHelp();
        }

        if (role === 'moderator') {
            return generateModHelp();
        }

        if (role === 'member') {
            return generateMemberHelp();
        }

        throw new InvalidCommandError('help', args);
    }
};
