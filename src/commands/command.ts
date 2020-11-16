import { Message, MessageEmbed } from 'discord.js';
import commands from './index';
import { getStore } from '../store';
import { getCommandHelp } from '../utils';
import type { Command } from '../types';
import { AppError, InvalidCommandError } from '../errors';

export default {
    name: 'command',
    command: 'command',
    description: 'Edit server commands.',
    examples: [
        '!command help',
        '!command help roles',
        '!command help add-role test-role',
        '!command help remove-role test-role',
        '!command help toggle-role test-role'
    ],
    roles: [
        'server-mod'
    ],
    async handler(message: Message, args: string[]) {
        const store = getStore('default');
        const commandName = args[0]; // help
        const command = args[1]; // toggle-role
        const role = args[2]; // test-role

        console.log({commandName, command, option: role});

        // Just print out the command's help
        if (!command) {
            const _command = commands.find(_command => _command.name === commandName) as Command;
            if (!_command) {
                throw new InvalidCommandError('command', args);
            }
            return new MessageEmbed()
                .setColor('#0099ff')
                .setURL('https://discord.js.org/')
                .setAuthor(commandName)
                .addFields(getCommandHelp(_command));
        }

         // Print roles for this command
        if (command === 'roles') {
            return store.commands[commandName].roles.join(', ');
        }

        // Add a role to either the allowed or ignored list for this command
        if (command === 'add-role') {
            if (!store.commands[commandName].roles.includes(role)) {
                store.commands[commandName].roles.push(role);
            }
            return 'roles ' + store.commands[commandName].roles.join(', ');
        }

        // Remove a role from either the allowed or ignored list for this command
        if (command === 'remove-role') {
            if (store.commands[commandName].roles.includes(role)) {
                const index = store.commands[commandName].roles.findIndex(_role => _role === role);
                store.commands[commandName].roles.splice(0, index);
            }
            return 'roles ' + store.commands[commandName].roles.join(', ');
        }

        // Toggle a role in either the allowed or ignored list for this command
        if (command === 'toggle-role') {
            // store.allowedRoles.push(role);
            return 'done!';
        }

        throw new InvalidCommandError('command', args);
    }
};
