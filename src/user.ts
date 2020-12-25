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

    public static async getUser(serverId: Server['id'], userId: User['id']) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${userId};`);

        // No user found
        if (users.length === 0) {
            return this.createUser(serverId, userId);
        }

        // Return existing user
        return new User(users[0]);
    }

    public static async createUser(serverId: Server['id'], userId: string) {
        // Create user
        await database.query(sql`INSERT INTO users(serverId,id) VALUES (${serverId},${userId});`);

        // Failed to create user
        const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${userId};`);
        if (users.length === 0) {
            throw new AppError(`Failed to create user ${userId}`);
        }

        // Return new user
        return new User(users[0]);
    }

    public async addExperience(experience: number) {
        log.debug(`Adding ${experience} experience to ${this.id}`);

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
};
