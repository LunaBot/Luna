import { Message } from 'discord.js';
import ml from 'ml-sentiment';
import { log } from '@/log';
import { Server } from '@/servers';
import { User } from '@/user';
import { moduleManager } from '@/module-manager';
import type { Announce } from '@/modules/moderation/commands';

const capValue = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

export class UserExperience {
  constructor(private server: Server, private user: User, private message: Message) {}

  /**
   * Analyse sentiment value of message
   * @param text string to analyse
   */
  private getSentiment(text: string) {
    return ml().classify(text);
  }

  /**
   * Add experience based on message sentiment
   * @param user 
   * @param message 
   */
  private async addExperience(user: User, message: Message) {
    const sentiment = this.getSentiment(message.content);
    const baseXp = 20;
    const sentimentPercentage = sentiment / 100;
    const experience = capValue(1 + (baseXp * sentimentPercentage), -20, 20);
    await user.addExperience(experience);
    log.debug('%s gained %s exp for "%s"', message.author.tag, experience, message.content);
  }

  /**
   * Announce level ups/downs and mutes
   * @param oldLevel The level BEFORE the message was processed.
   * @param newLevel The level AFTER the message was processed.
   */
  private async announceChanges(oldLevel: number, newLevel: number) {
    const { server, message } = this;

    // Nothing happened, bail
    if (oldLevel === newLevel) {
      return;
    }

    // Get announce command
    const announce = moduleManager.getCommand('announce') as Announce | undefined;
    // const mute = moduleManager.getCommand('mute') as Mute | undefined;

    // The command isn't loaded
    if (!announce) {
      return;
    }
  
    // Mute user as they fell under level 0
    if (oldLevel !== 0 && newLevel === 0) {
      // @TODO: Add "mute" method to the user class
      // await mute.handler();
      await announce.handler(server.prefix, message, `<#${server.channels.botCommands}> <@!${message.author.id}> you've been muted, please re-read the rules!`.split(' '));
      return;
    }
  
    // User has gone up a level
    if (oldLevel < newLevel) {
      await announce.handler(server.prefix, message, `<#${server.channels.botCommands}> <@!${message.author.id}> is now level ${newLevel}`.split(' '));
    }
  
    // User has gone down a level
    if (oldLevel > newLevel) {
      await announce.handler(server.prefix, message, `<#${server.channels.botCommands}> <@!${message.author.id}> watch your language you've just gone down to level ${newLevel}`.split(' '));
    }
  }

  public async process() {
    const { server, user, message } = this;
    const oldLevel = user.level;
    
    // Add experience
    await this.addExperience(user, message);
    
    // Announce level changes
    if (server.channels.botCommands) {
      const newLevel = user.level;
      await this.announceChanges(oldLevel, newLevel);
    }
  }
};
