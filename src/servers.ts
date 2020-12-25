import fs from 'fs';
import path from 'path';
import { sql } from '@databases/pg';
import { loadJsonFile } from './utils';
import { database } from './database';
import { AppError } from './errors';
import { User } from './user';

interface Command {
    roles: string[];
}

type Alias = string;

interface ServerOptions {
    id: string;
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
    public id: string;
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

    constructor(options: Partial<ServerOptions> & { id: ServerOptions['id'] }) {
        this.id = options.id;
        this.prefix = options.prefix ?? '!';
        this.commands = options.commands ?? {};
        this.channels = options.channels ?? {};
        this.users = Object.fromEntries(Object.entries((options.users ?? {}) as any).map(([id, user]) => [id, new User(user as any)])) ?? {};
        this.aliases = options.aliases ?? {};
    }

    public async getUser(id: User['id']) {
        return User.getUser(this.id, id);
    }

    public async createUser(id: string) {
        return User.createUser(this.id, id);
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
