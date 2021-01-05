import humanizeDuration from 'humanize-duration';
import { envs } from '@/envs';
import { isTextChannelMessage } from '@/guards';
import { log } from '@/log';
import { Server } from '@/servers';
import type { Message } from 'discord.js';
import { client } from '@/client';

let isStarting = true;

export const message = async (message: Message) => {
  // @ts-expect-error
  message.startedProcessingTimestamp = new Date();
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
  // @todo: make this dynamic from db
  if (message.channel.id === '776990572052742175') {
    return;
  }

  // If the person mentioned is the bot
  // Only trigger on `@AutoMod test` not `test @AutoMod`
  // We don't need this triggering mid-sentence
  if (message.content.startsWith(`<@!${client.user?.id}>`)) {
    client.emit('mentioned', message);
    return;
  }

  // Only continue in a text channel and they actually sent a message
  if (isTextChannelMessage(message) && message.content.trim() !== '') {
    // Get current server
    const server = await Server.findOrCreate({ id: message.guild.id });

    // Process message
    const user = await server.getUser({ id: message.author.id });
    await user.processMessage(message);
  }
};
