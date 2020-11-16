import { Message } from 'discord.js';
import { getStore } from './store';
import _commands from './commands';
import { AppError, InvalidCommandError, CommandPermissionError, MultiLinePermissionError } from './errors';

const getCommand = (commandName: string) => _commands.find(_command => _command.name === commandName);

export const messageHandler = async (message: Message) => {
  // Skip bot messages
  if (message.author.bot) return;

  // Skip messages without our prefix
  const store = getStore('default');
  if (!message.content.startsWith(store.prefix)) return;

  // Log full message
  console.debug(`[${message.author.tag}]: ${message.content}`);

  const _commandBody = message.content.slice(store.prefix.length);
  const commandBody = _commandBody.split('\n')[0];
  const args = commandBody.split(' ');
  const commandName = args.shift()?.toLowerCase().trim();
  const mutlilineCommand = _commandBody.split('\n').length >= 2;

  try {
    // Bail if there's no command given
    if (!commandName) {
      return;
    }

    // Bail if the command isn't valid
    const command = getCommand(commandName);
    if (!command) {
      throw new InvalidCommandError(commandName, args);
    }

    // Don't allow multi-line commands
    if (mutlilineCommand) {
      throw new MultiLinePermissionError(commandName);
    }    

    // Check we have permission to run this
    if (!message.member?.roles.cache.some(role => command.roles.includes(role.name))) {
      throw new CommandPermissionError(commandName);
    }

    // Run the command
    const result = await (command.handler(message, args) as Promise<any>).catch(error => {
      if (error instanceof AppError) {
        return error.message;
      }

      console.error(error);
      if (args.length >= 1) {
        return `\`!${commandName} ${args.join(' ')}\` failed with error "${error.message}"`;
      }

      return `\`!${commandName}\` failed with error "${error.message}"`;
    });

    message.reply(result);
  } catch (error) {
    if (args.length >= 1) {
      message.reply(`\`!${commandName} ${args.join(' ')}\` failed with error "${error.message}"`);
    } else {
      message.reply(`\`!${commandName}\` failed with error "${error.message}"`);
    }
  }
};
