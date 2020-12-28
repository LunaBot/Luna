import humanizeDuration from 'humanize-duration';
import { envs } from '../../envs';
import { log } from '../../log';
import { Server } from '../../servers';
import type { Message } from 'discord.js';

export const capValue = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

let isStarting = true;

export const message = async (message: Message) => {
  // In development mode only allow the bot's own server to process
  if (envs.NODE_ENV === 'development' && message.guild?.id !== envs.OWNER.SERVER) {
    return;
  }

  // Skip bot messages
  if (message.author.bot) return;

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

  // Skip non allowed channels
  if (message.channel.id === '776990572052742175') {
    return;
  }

  // Process message
  const server = await Server.findOrCreate({ id: message.guild!.id });
  const user = await server.getUser({ id: message.author.id });
  await user.processMessage(message);
};
