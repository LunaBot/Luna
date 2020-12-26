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
    const user = await User.Find({
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
    try {

      // User's only on one server
      if (user.length === 1) {
        return `Level ${user[0].level}. Total experience ${user[0].experience ?? 0}`;
      }

      // User's on multiple servers
      const globalLevel = user.reduce((level, user) => level + user.level, 0);
      const globalExperience = Math.floor(user.reduce((experience, user) => experience + user.experience, 0));
      const localUser = user.find(user => user.serverId === server.id)!;
      return `Global level ${globalLevel}. Global experience ${globalExperience}\nLocal level ${localUser.level}. Local experience ${Math.floor(localUser.experience)}`;
    } catch (error) {
      console.error(error);
      return 'Failed getting level';
    }
  }
};

export default new Level();