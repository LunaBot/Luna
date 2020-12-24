import fs from 'fs';
import path from 'path';
import { sql } from '@databases/pg';
import { loadJsonFile } from './utils';
import { database } from './database';
import { AppError } from './errors';
import { User as UserOptions } from './types';

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
};

export class User {
    public id: string;
    public experience = 0;

    constructor(options: Partial<UserOptions> & { id: User['id'] }) {
        this.id = options.id;
        this.experience = options.experience ?? 0;
    }

    public async addExperience(experience: number) {
        // Update local cache
        this.experience += experience;
        // Update database
        await database.query<User>(sql`UPDATE users SET experience=${experience} WHERE id=${this.id}`);
    }
    
    public async resetExperience() {
        // Update local cache
        this.experience = 0;
        // Update database
        await database.query<User>(sql`UPDATE users SET experience=0 WHERE id=${this.id}`);
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
        this.users = Object.fromEntries(Object.entries((options.users ?? {}) as any).map(([id, user]) => [id, new User(user as any)])) ?? {};
        this.aliases = options.aliases ?? {};
    }

    public async getUser(id: User['id']) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE id=${id};`);

        // No user found
        if (users.length === 0) {
            return this.createUser(id);
        }

        // Return existing user
        return new User(users[0]);
    }

    public async createUser(id: string) {
        // Create user
        await database.query(sql`INSERT INTO users(id) VALUES (${id});`).catch(error => {
            throw new AppError(`Failed to create user ${id}`);
        });

        // Failed to create user
        const users = await database.query<User>(sql`SELECT * FROM users WHERE id=${id};`);
        if (users.length === 0) {
            throw new AppError(`Failed to create user ${id}`);
        }

        // Return new user
        return new User(users[0]);
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
