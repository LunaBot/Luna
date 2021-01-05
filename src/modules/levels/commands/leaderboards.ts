import { sql } from '@databases/pg';
import dedent from 'dedent';
import join from 'url-join';
import { Command } from '@/command';
import { config } from '@/config';
import { database } from '@/database';
import { envs } from '@/envs';
import { AppError } from '@/errors';
import { isDMChannelMessage, isTextChannelMessage } from '@/guards';
import { Server } from '@/servers';
import { User } from '@/user';
import type { Message } from 'discord.js';

class Leaderboard {
  constructor(private users: User[]) {}

  toString() {
    return this.users.slice(0, 10).map(user => `<@${user.id}> with ${user.experience} exp at level ${user.level}`).join('\n');
  }

  toJSON() {
    return this.toString();
  }
}

export class Leaderboards extends Command {
  public name = 'Leaderboards';
  public command = 'leaderboards';
  public timeout = Command.TIMEOUTS.FIVE_SECONDS;
  public description = 'Show the current leaderboards';
  public hidden = false;
  public owner = false;
  public examples = [ '!leaderboards' ];
  public roles = [ '@everyone' ];

  private async getLocalLeaderboards({ serverId, }: { serverId: Server['id'], }) {
    // Top 100 users
    const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} ORDER BY experience DESC LIMIT 100;`).then(users => {
        return users.map(user => new User(user));
    });
    const leaderboard = Object.values(users).sort((userA, userB) => {
        if (userA.experience < userB.experience) return 1;
        if (userA.experience > userB.experience) return -1;
        return 0;
    });
    const positveLeaderboard = new Leaderboard(leaderboard.filter(user => user.experience >= 0));
    const negativeLeaderboard = new Leaderboard(leaderboard.filter(user => user.experience < 0));

    return dedent`
        **Top members**
        ${positveLeaderboard.toString()}

        **Salty bitches**
        ${negativeLeaderboard.toString()}
    `;
  }

  private async getGlobalLeaderboards() {
    return '';
    // const user = await User.Find({ id });
    // const level = user.reduce((level, user) => level + user.level, 0);
    // const experience = Math.floor(user.reduce((experience, user) => experience + user.experience, 0));
    // return `Global level ${level}. Global experience ${experience}.`;
  }

  async handler(_prefix: string, message: Message, _args: string[]) {
    // Global leaderboards
    if (isDMChannelMessage(message)) {
      return this.getGlobalLeaderboards();
    }

    // Server dependant leaderboards
    if (isTextChannelMessage(message)) {
      // Only owner can show leaderboards for now
      if (message.author.id !== envs.OWNER.ID) {
        const server = await Server.findOrCreate({ id: message.guild?.id });
        return `Leaderboard: ${join(config.PUBLIC_URL, 'leaderboard', server.id)}`;
      }

      const serverId = message.guild.id;
      const localLeaderboards = await this.getLocalLeaderboards({ serverId });
      const globalLeaderboards = await this.getGlobalLeaderboards();

      return `${localLeaderboards}\n${globalLeaderboards}`;
    }

    throw new AppError('Invalid channel type "%s".', message.channel.type);
  }
};