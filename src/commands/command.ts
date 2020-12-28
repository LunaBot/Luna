import { Message, MessageEmbed } from 'discord.js';
import { InvalidCommandError } from '../errors';
import { log } from '../log';
import { Server } from '../servers';
import { getCommandHelp } from '../utils';
import commands from './index';
import type { Command } from '../command';

export default {
    name: 'command',
    command: 'command',
    timeout: 5000,
    description: 'Show command help.',
    hidden: false,
    owner: false,
    examples: [
        'command help',
        'command help roles',
        'command help add-role test-role',
        'command help remove-role test-role',
        'command help toggle-role test-role'
    ],
    roles: [
        'server-mod'
    ],
    async handler(prefix: string, message: Message, args: string[]) {
        const server = await Server.findOrCreate({ id: message.guild!.id });
        const commandName = args[0]; // help
        const command = args[1]; // toggle-role
        const role = args[2]; // test-role

        log.debug('commandHandler', {commandName, command, option: role});

        // Just print out the command's help
        if (!command) {
            const _command = (commands as Command[]).find(_command => _command.name === commandName);
            if (!_command) {
                throw new InvalidCommandError(prefix, 'command', args);
            }
            return new MessageEmbed()
                .setColor('#0099ff')
                .setURL('https://discord.js.org/')
                .setAuthor(commandName)
                .addFields(getCommandHelp(_command, prefix));
        }

         // Print roles for this command
        if (command === 'roles') {
            return server.commands[commandName].roles.join(', ');
        }

        // Add a role to either the allowed or ignored list for this command
        if (command === 'add-role') {
            if (!server.commands[commandName].roles.includes(role)) {
                server.commands[commandName].roles.push(role);
            }
            return 'roles ' + server.commands[commandName].roles.join(', ');
        }

        // Remove a role from either the allowed or ignored list for this command
        if (command === 'remove-role') {
            if (server.commands[commandName].roles.includes(role)) {
                const index = server.commands[commandName].roles.findIndex(_role => _role === role);
                server.commands[commandName].roles.splice(0, index);
            }
            return 'roles ' + server.commands[commandName].roles.join(', ');
        }

        // Toggle a role in either the allowed or ignored list for this command
        if (command === 'toggle-role') {
            // store.allowedRoles.push(role);
            return 'done!';
        }

        throw new InvalidCommandError(prefix, 'command', args);
    }
};
