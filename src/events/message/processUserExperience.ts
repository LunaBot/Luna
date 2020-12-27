import ml from 'ml-sentiment';
import { Message } from 'discord.js';
import { Server } from '../../servers';
import { log } from '../../log';
import announce from '../../commands/announce';
import { capValue } from './index';

export const processUserExperience = async (message: Message) => {
  const server = await Server.findOrCreate({ id: message.guild!.id });
  const user = await server.getUser({ id: message.author.id });

  // Analyse sentiment value of message
  const sentiment = ml().classify(message.content);

  // Add experience based on message sentiment
  const oldLevel = user.level;
  const baseXp = 20;
  const sentimentPercentage = sentiment / 100;
  const experience = capValue(1 + (baseXp * sentimentPercentage), -20, 20);
  await user.addExperience(experience);
  log.debug('%s gained %s exp for "%s"', message.author.tag, experience, message.content);

  // Announce level ups/downs
  const newLevel = user.level;

  // Nothing happened, bail
  if (oldLevel === newLevel) {
    return;
  }

  // Mute user as they fell under level 0
  if (oldLevel !== 0 && newLevel === 0) {
    await announce.handler(server.prefix, message, `<#776990572052742175> <@!${message.author.id}> you've been muted, please re-read the rules!`.split(' '));
    return;
  }

  // User has gone up a level
  if (oldLevel < newLevel) {
    await announce.handler(server.prefix, message, `<#776990572052742175> <@!${message.author.id}> is now level ${newLevel}`.split(' '));
  }

  // User has gone down a level
  if (oldLevel > newLevel) {
    await announce.handler(server.prefix, message, `<#776990572052742175> <@!${message.author.id}> watch your language you've just gone down to level ${newLevel}`.split(' '));
  }
};
