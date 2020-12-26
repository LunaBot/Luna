import type { Message } from 'discord.js';
import { Server } from '../servers';
import { User } from '../user';
import { Command } from '../command';

class Leaderboard {
  constructor(private users: User[]) {}

  toString() {
    return this.users.slice(0, 10).map(user => `<@${user.id}> with ${user.experience} exp at level ${user.level}`).join('\n');
  }

  toJSON() {
    return this.toString();
  }
}

class Level extends Command {
  public name = 'level';
  public command = 'level';
  public timeout = 5000;
  public description = 'Get your current level';
  public hidden = false;
  public owner = false;
  public examples = [ '!level' ];
  public roles = [ '@everyone' ];

  async handler(_prefix: string, message: Message, _args: string[]) {
    const server = await Server.Find({ id: message.guild!.id });
    const user = await server.getUser({
      id: message.author.id
    });

    // All users
    // if (args[0] === 'all') {
    //   const leaderboard = Object.values(server.users).sort((userA, userB) => {
    //     if (userA.experience < userB.experience) return 1;
    //     if (userA.experience > userB.experience) return -1;
    //     return 0;
    //   });
    //   const positveLeaderboard = new Leaderboard(leaderboard.filter(user => user.experience >= 0));
    //   const negativeLeaderboard = new Leaderboard(leaderboard.filter(user => user.experience < 0));

    //   return dedent`
    //     **Top members**
    //     ${positveLeaderboard.toString()}

    //     **Salty bitches**
    //     ${negativeLeaderboard.toString()}
    //   `;
    // }

    // Multiple user objects
    if (Array.isArray(user)) {
      const level = user.reduce((level, user) => level + user.level, 0);
      const experience = user.reduce((experience, user) => experience + user.experience, 0);
      return `Level ${level}. Total experience ${experience}`;
    }

    return `Level ${user.level}. Total experience ${user.experience ?? 0}`;
  }
};

export default new Level();