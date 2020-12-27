import type { Message } from 'discord.js';
import { User } from '../user';
import { Command } from '../command';
import { isDMChannelMessage, isTextChannelMessage } from '../guards';
import { AppError } from '../errors';

export class Level extends Command {
  public name = 'level';
  public command = 'level';
  public timeout = 5000;
  public description = 'Get your current level';
  public hidden = false;
  public owner = false;
  public examples = [ '!level' ];
  public roles = [ '@everyone' ];

  private async getLocalLevel({ id, serverId, }: { id: User['id'], serverId: User['id'], }) {
    const user = await User.Find({ id, serverId });
    return `Level ${user[0].level}. Total experience ${user[0].experience ?? 0}`;
  }

  private async getGlobalLevel({ id, }: { id: User['id'], }) {
    const user = await User.Find({ id });
    const level = user.reduce((level, user) => level + user.level, 0);
    const experience = Math.floor(user.reduce((experience, user) => experience + user.experience, 0));
    return `Global level ${level}. Global experience ${experience}.`;
  }

  async handler(_prefix: string, message: Message, _args: string[]) {
    const userId = message.author.id;

    // Global level
    if (isDMChannelMessage(message)) {
      return this.getGlobalLevel({ id: userId });
    }

    // Server dependant level
    if (isTextChannelMessage(message)) {
      const serverId = message.guild.id;
      const localLevel = await this.getLocalLevel({ id: userId, serverId });
      const globalLevel = await this.getGlobalLevel({ id: userId });

      return `${localLevel}\n${globalLevel}`;
    }

    throw new AppError('Invalid channel type "%s".', message.channel.type);
  }
};

export default new Level();