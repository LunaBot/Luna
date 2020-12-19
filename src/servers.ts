import fs from 'fs';
import path from 'path';
import { loadJsonFile } from './utils';

interface Command {
    roles: string[];
}

class LevelManager {
    static Equate(experience: number) {
      return Math.floor(experience + 300 * Math.pow(2, experience / 7));
    }
  
    static LevelToExperience(level: number) {
      let experience = 0;
      for (let i = 1; i < level; i++) experience += this.Equate(i);
      return Math.floor(experience / 4);
    }
  
    static ExperienceToLevel(experience: number) {
      let level = 0;
      while (LevelManager.LevelToExperience(level) < experience) level++;
      return level;
    }
}

interface UserOptions {
    id: string;
    experience: number;
}

export class User {
    public id: string;
    public experience = 0;

    constructor(options: Partial<UserOptions> & { id: UserOptions['id'] }) {
        this.id = options.id;
        this.experience = options.experience ?? 0;
    }

    public addExperience(experience: number) {
        this.experience += experience;
    }
    
    public resetExperience() {
        this.experience = 0;
    }

    get level() {
        return LevelManager.ExperienceToLevel(this.experience);
    }
}

type Alias = string;

interface ServerOptions {
    prefix: string;
    commands: {
        [key: string]: Command
    }
    channels: {
        botCommands: string;
    }
    users: {
        [key: string]: User
    }
    aliases: {
        [command: string]: Alias
    }
}

export class Server {
    public prefix: string;
    public commands: {
        [key: string]: Command
    }
    public channels: {
        botCommands?: string;
    }
    public users: {
        [key: string]: User
    }
    public aliases: {
        [command: string]: Alias
    }

    constructor(options: Partial<ServerOptions>) {
        this.prefix = options.prefix ?? '!';
        this.commands = options.commands ?? {};
        this.channels = options.channels ?? {};
        this.users = Object.fromEntries(Object.entries(options.users as any).map(([id, user]) => [id, new User(user as any)])) ?? {};
        this.aliases = options.aliases ?? {};
    }

    public getUser(userId: string) {
        const user = this.users[userId]
        if (!user) {
            const newUser = new User({
                id: userId
            });
            this.users[userId] = newUser;
            return newUser;
        }

        return user instanceof User ? user : new User(user);
    }
}

const serversFilePath = path.resolve(__dirname, '..', 'servers.json');

const servers = Object.fromEntries(Object.entries(loadJsonFile(serversFilePath, {
    default: {
        prefix: '!',
        commands: {
            help: {
                roles: ['@everyone']
            }
        },
        channels: {
            botCommands: ''
        },
        users: {},
        aliases: {}
    }
})).map(([serverId, server]) => [serverId, new Server(server as any)]));

export const serversCount = servers ? Object.keys(servers).length - 1 : 0;

export const getServer = (serverId: string): Server => {
    if (!Object.keys(servers).includes(serverId)) {
        servers[serverId] = servers.default;
    }

    return servers[serverId];
};

export const saveServers = () => {
    fs.writeFileSync(serversFilePath, JSON.stringify(servers, null, 2));
};
