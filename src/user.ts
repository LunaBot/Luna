import { sql } from '@databases/pg';
import { database } from './database';
import { LevelManager } from './levels';
import { AppError } from './errors';
import { log } from './log';
import { Server } from './servers';

interface UserOptions {
    id: string;
    experience: number;
};

export class User {
    public id: string;
    public experience = 0;

    constructor(options: Partial<UserOptions> & { id: User['id'] }) {
        this.id = options.id;
        this.experience = options.experience ?? 0;
    }

    public static async Find({ serverId, id }: { serverId: Server['id'], id: User['id'] } ) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${id};`);

        // No user found
        if (users.length === 0) {
            return this.Create({ serverId, id });
        }

        // Return existing user
        return new User(users[0]);
    }

    public static async Create({ serverId, id }: { serverId: Server['id'], id: User['id'] } ) {
        // Create user
        await database.query(sql`INSERT INTO users(serverId,id) VALUES (${serverId},${id});`);

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
        await database.query<User>(sql`UPDATE users SET experience=${this.experience} WHERE id=${this.id}`);
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
