import { sql } from '@databases/pg';
import { database } from './database';
import { AppError } from './errors';
import { LevelManager } from './levels';
import { log } from './log';
import { Server } from './servers';

interface PanelOptions {
    id: string;
    serverId: string;
    experience: number;
};

export class Panel {
    public id: string;
    public serverId: string;
    public experience = 0;

    constructor(options: Partial<UserOptions> & { id: User['id'], serverId: User['serverId'] }) {
        this.id = options.id;
        // serverId is the correct field
        // serverid is returned from the database
        this.serverId = options.serverId ?? (options as any).serverid;
        this.experience = Number(options.experience) ?? 0;
    }

    private static async _Find({ serverId, id }: { serverId: Server['id'], id: User['id'] } ) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${id};`);

        // No user found
        if (users.length === 0) {
            return this.Create({ serverId, id });
        }

        // Return existing user
        return new User(users[0]);
    }

    private static async _FindAll({ id }: { id: User['id'] } ) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE id=${id};`);

        // Return existing user
        return users.map(user => new User(user));
    }

    public static async Find({ id, serverId, }: { id: User['id'], serverId?: Server['id'], } ) {
        // Get specific user instance
        if (serverId) {
            return [await this._Find({ id, serverId, })];
        }

        return this._FindAll({ id });
    }

    public static async Create({ serverId, id }: { serverId: Server['id'], id: User['id'] } ) {
        // Create user
        const experience = 0;
        await database.query(sql`INSERT INTO users(serverId,id,experience) VALUES (${serverId},${id},${experience});`);

        // Failed to create user
        const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${id};`);
        if (users.length === 0) {
            throw new AppError(`Failed to create user ${id}`);
        }

        // Return new user
        return new User(users[0]);
    }

    public async addExperience(experience: number) {
        log.debug(`Adding ${experience} experience to ${this.id}`);

        // Update local cache
        this.experience += experience;
        // Update database
        await database.query<User>(sql`UPDATE users SET experience=experience+${experience} WHERE serverId=${this.serverId} AND id=${this.id}`);
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
};
