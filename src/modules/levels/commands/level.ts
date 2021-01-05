import join from 'url-join';
import { Command } from '@/command';
import { config } from '@/config';
import { AppError } from '@/errors';
import { isDMChannelMessage, isTextChannelMessage } from '@/guards';
import { Server } from '@/servers';
import { User } from '@/user';
import type { Message } from 'discord.js';

export class Level extends Command {
  public name = 'Level';
  public command = 'level';
  public timeout = Command.TIMEOUTS.FIVE_SECONDS;
  public description = 'Get your current level';
  public hidden = false;
  public owner = false;
  public examples = [ '!level' ];
  public roles = [ '@everyone' ];

  private async getLocalLevel({ id, serverId, }: { id: User['id'], serverId: Server['id'], }) {
    const user = await User.findOrCreate({ id, serverId });
    return `Level ${user.level}. Total experience ${user.experience ?? 0}`;
  }

  private async getGlobalLevel({ id, }: { id: User['id'], }) {
    const user = await User.findOrCreate({ id });
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
      const leaderboardLink = `Leaderboard: ${join(config.PUBLIC_URL, 'leaderboard', serverId)}`;

      return `${localLevel}\n${globalLevel}\n${leaderboardLink}`;
    }

    throw new AppError('Invalid channel type "%s".', message.channel.type);
  }
};
