import type { Message } from 'discord.js';
import { Server } from '../servers';
// import _commands from '../commands';
// import { config } from '../config';
// import botCommand from '../commands/bot';
import { log } from '../log';
// import { AppError, InvalidCommandError, CommandPermissionError, MultiLinePermissionError } from '../errors';

// const getCommand = (commandName: string) => _commands.find(_command => _command.name === commandName);

export const messageUpdate = async (_oldMessage: Message, newMessage: Message) => {
  // Skip bot messages
  if (newMessage.author.bot) return;

  // Skip messages without our prefix
  const server = await Server.findOrCreate({ id: newMessage.guild!.id });
  if (!newMessage.content.startsWith(server.prefix)) return;

  // Log full message
  log.debug(`[${newMessage.author.tag}]: ${newMessage.content}`);

  // const _commandBody = message.content.slice(server.prefix.length);
  // const commandBody = _commandBody.split('\n')[0];
  // const args = commandBody.split(' ');
  // const commandName = args.shift()?.toLowerCase().trim();
  // const mutlilineCommand = _commandBody.split('\n').length >= 2;

  // try {
  //   // Bail if there's no command given
  //   if (!commandName) {
  //     return;
  //   }

  //   // Bail if the command isn't valid
  //   const command = getCommand(commandName);
  //   if (!command) {
  //     throw new InvalidCommandError(server.prefix, commandName, args);
  //   }

  //   // Don't allow multi-line commands
  //   if (mutlilineCommand) {
  //     throw new MultiLinePermissionError();
  //   }

  //   // Internal bot commands
  //   // These shouold only work for the person that created the bot
  //   if (commandName === botCommand.command) {
  //     // Non-owner user tried accessing bot commands, throw error
  //     if (config.OWNER.ID !== message.member?.id) {
  //       log.warn('%s tried accessing the bot commands via server %s', message.member?.id, message.guild?.id);
  //       throw new CommandPermissionError(commandName);
  //     }

  //     // Owner tried bot commands on wrong server, warn them
  //     if (config.OWNER.SERVER !== message.guild?.id) {
  //       throw new AppError('wrong server! %sbot can only be used on the server listed in `config.json`', server.prefix);
  //     }
  //   }

  //   // Don't check permissions if this is the owner of the bot
  //   if (config.OWNER.ID !== message.member?.id) {
  //     // Check we have permission to run this
  //     if (!message.member?.roles.cache.some(role => command.roles.includes(role.name))) {
  //       throw new CommandPermissionError(commandName);
  //     }
  //   }

  //   // Run the command
  //   const commandPromise = command.handler(server.prefix, message, args);
  //   const result = await pTimeout(commandPromise, 300).catch(error => {
  //     if (error instanceof AppError) {
  //       return error.message;
  //     }

  //     if (args.length >= 1) {
  //       return `\`${server.prefix}${commandName} ${args.join(' ')}\` failed with error "${error.message}"`;
  //     }

  //     return `\`${server.prefix}${commandName}\` failed with error "${error.message}"`;
  //   });

  //   if (!result) {
  //     throw new AppError('No command output');
  //   }

  //   message.reply(result);
  // } catch (error) {
  //   if (args.length >= 1) {
  //     message.reply(`\`${server.prefix}${commandName} ${args.join(' ')}\` failed with error "${error.message}"`);
  //   } else {
  //     message.reply(`\`${server.prefix}${commandName}\` failed with error "${error.message}"`);
  //   }
  // }
};
