import { sql } from '@databases/pg';
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

    public async getUser({ id }: { id: User['id'] }) {
        return User.Find({ id, serverId: this.id });
    }

    public async createUser({ id }: { id: User['id'] }) {
        return User.Create({ id, serverId: this.id });
    }

    public static async Find({ id }: { id: Server['id'] } ) {
        const servers = await database.query<ServerOptions>(sql`SELECT * FROM servers WHERE id=${id};`);

        // No server found
        if (servers.length === 0) {
            return this.Create({ id });
        }

        // Return existing server
        return new Server(servers[0]);
    }

    public static async Create({ id }: { id: Server['id'] } ) {
        // Create server
        const prefix = '!';
        await database.query(sql`INSERT INTO servers(id,prefix) VALUES (${id},${prefix});`);

        // Failed to create server
        const servers = await database.query<ServerOptions>(sql`SELECT * FROM servers WHERE id=${id};`);
        if (servers.length === 0) {
            throw new AppError(`Failed to create server ${id}`);
        }
 
        // Return new server
        return new Server(servers[0]);
    }
};
