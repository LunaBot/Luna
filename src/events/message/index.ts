import humanizeDuration from 'humanize-duration';
import type { Message } from 'discord.js';
import { Server } from '../../servers';
import _commands from '../../commands';
import { envs } from '../../envs';
import botCommand from '../../commands/bot';
import { log } from '../../log';
import { promiseTimeout } from '../../utils';
import { AppError, InvalidCommandError, CommandPermissionError, MultiLinePermissionError } from '../../errors';
import { processUserExperience } from './processUserExperience';

const getCommand = (commandName: string) => _commands.find(_command => _command.name === commandName);
const isCommandAlias = (server: Server, commandName: string) => Object.keys(server.aliases).includes(commandName);
export const capValue = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

// In milliseconds
const FIVE_SECONDS = 5000;

let isStarting = true;

export const message = async (message: Message) => {
  // In development mode only allow the bot's own server to process
  if (envs.NODE_ENV === 'development' && message.guild?.id !== envs.OWNER.SERVER) {
    return;
  }

  // Skip if bot is still starting up
  if (isStarting) {
    // Will be false after 10s of uptime
    isStarting = process.uptime() <= 10;

    // Is still under 10s bail
    if (isStarting) {
      log.silly(`Skipping message as bot has only been up for ${humanizeDuration(process.uptime() * 1000)}.`);
      return;
    }
  }

  let silent = false;

  // Get our server
  const server = await Server.Find({ id: message.guild!.id });

  // Skip bot messages
  if (message.author.bot) return;

  // Skip non allowed channels
  if (message.channel.id === '776990572052742175') {
    return;
  }

  // Process user experience
  await processUserExperience(message).catch(error => {
    console.log(error);
  });

  // Skip messages without our prefix
  if (!message.content.startsWith(server.prefix)) return;

  // Silent the output
  if (message.content.startsWith(server.prefix + '$')) {
    // Enable silent mode
    silent = true;
  }

  // Log full message
  log.debug(`[${message.author.tag}]: ${message.content}`);

  const _commandBody = message.content.slice(silent ? server.prefix.length + 1 : server.prefix.length);
  const commandBody = _commandBody.split('\n')[0];
  const args = commandBody.split(' ');
  const commandName = args.shift()?.toLowerCase()?.trim();
  const mutlilineCommand = _commandBody.split('\n').length >= 2;

  try {
    // Bail if there's no command given
    if (!commandName) {
      return;
    }

    // Bail if the command isn't valid
    const command = getCommand(isCommandAlias(server, commandName) ? server.aliases[commandName] : commandName);
    if (!command) {
      throw new InvalidCommandError(server.prefix, commandName, args);
    }

    // Don't allow multi-line commands
    if (mutlilineCommand) {
      throw new MultiLinePermissionError();
    }

    // Internal bot commands
    // These should only work for the person that created the bot
    if (commandName === botCommand.command) {
      // Non-owner user tried accessing bot commands, throw error
      if (envs.OWNER.ID !== message.member?.id) {
        log.warn('%s tried accessing the bot commands via server %s', message.member?.id, message.guild?.id);
        throw new CommandPermissionError(server.prefix, commandName);
      }

      // Owner tried bot commands on wrong server, warn them
      if (envs.OWNER.SERVER !== message.guild?.id) {
        throw new AppError('wrong server! %sbot can only be used on the server listed in `config.json`', server.prefix);
      }
    }

    // Don't check permissions if this is the owner of the bot
    if (envs.OWNER.ID !== message.member?.id) {
      // Check we have permission to run this
      if (!message.member?.roles.cache.some(role => command.roles.includes(role.name))) {
        throw new CommandPermissionError(server.prefix, commandName);
      }
    }

    // Ensure we have the right amount of args
    if (command.arguments.minimum !== undefined || command.arguments.maximum !== undefined) {
      if (args.length < command.arguments.minimum) {
        throw new AppError('Not enough args, %s requires at least %s args.', command.name, command.arguments.minimum);
      }

      if (args.length > command.arguments.maximum) {
        throw new AppError('Too many args, %s requires no more than %s args.', command.name, command.arguments.maximum);
      }
    }

    // Run the command
    const commandPromise = Promise.resolve(command.handler(server.prefix, message, args));
    const result = await promiseTimeout(commandPromise, command.timeout ?? FIVE_SECONDS);

    // No output
    if (!result) {
      throw new AppError('No command output');
    }

    // If result is a string and starts with a capital
    if (typeof result === 'string' && /^[a-z]/.test(result)) {
      log.warn(`Command output started with a lowercase "${result}".`);
    }

    // Skip output
    if (silent) return;

    // Respond with command output
    message.channel.send(result as string);
  } catch (error) {
    // Reply with error
    if (process.env.DEBUG) {
      // Show debugging to owner
      if (envs.OWNER.ID === message.member?.id) {
        message.channel.send('```json\n' + JSON.stringify(error, null, 2) + '\n```');
        return;
      }
    }

    log.error(error);
    message.channel.send(error.message);
  }
};
