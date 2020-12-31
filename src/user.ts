import { sql } from '@databases/pg';
import { Message } from 'discord.js';
import _commands from './commands';
import botCommand from './commands/bot';
import { database } from './database';
import { envs } from './envs';
import {
    AppError,
    CommandPermissionError,
    InvalidCommandError,
    MultiLinePermissionError
    } from './errors';
import { UserExperience } from './events/message/user-experience';
import { isTextChannelMessage } from './guards';
import { LevelManager } from './levels';
import { log } from './log';
import { Server } from './servers';
import { promiseTimeout } from './utils';

interface UserOptions {
    id: string;
    displayName: string;
    displayImage: string;
    serverId: string;
    experience: number;
    messages: number;
};

// In milliseconds
const FIVE_SECONDS = 5000;

const getCommand = (commandName: string) => {
    const command = _commands.find(_command => _command.command === commandName);
    log.silly('Searching for %s, found %s', commandName, JSON.stringify(command));
    return command;
};
const isCommandAlias = (server: Server, commandName: string) => Object.keys(server.aliases).includes(commandName);

export class User {
    public id: string;
    public displayName: string;
    public displayImage: string;
    public serverId: string;
    public experience = 0;
    public messages = 0;

    constructor(options: Partial<UserOptions> & { id: User['id'], serverId: User['serverId'] }) {
        this.id = options.id;
        // serverId is the correct field
        // serverid is returned from the database
        this.serverId = options.serverId ?? (options as any).serverid;
        // displayName is the correct field
        // displayname is returned from the database
        this.displayName = options.displayName ?? (options as any).displayname;
        // displayImage is the correct field
        // displayimage is returned from the database
        this.displayImage = options.displayImage ?? (options as any).displayimage;
        this.experience = Number(options.experience) ?? 0;
        this.messages = Number(options.messages) ?? 0;
    }

    private static async _findAll({ id }: { id: User['id'] }) {
        const users = await database.query<User>(sql`SELECT * FROM users WHERE id=${id};`);

        // Return existing user
        return users.map(user => new User(user));
    }

    public static async find({ id, serverId, }: { id: User['id'], serverId?: Server['id'], }) {
        // Get specific user instance
        if (serverId) {
            const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${id};`);

            // No user found
            if (users.length === 1) {
                return;
            }

            // Return existing user
            return [new User(users[0])];
        }

        return this._findAll({ id });
    }

    public static async findOrCreate({ id, }: { id: User['id'], }): Promise<User[]>;
    public static async findOrCreate({ id, serverId, }: { id: User['id'], serverId?: Server['id'], }): Promise<User>;
    public static async findOrCreate({ id, serverId, }: { id: User['id'], serverId?: Server['id'], }) {
        // Get specific user instance
        if (serverId) {
            const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} AND id=${id};`);

            // No user found
            if (users.length === 0) {
                return this.create({ serverId, id });
            }

            // Return existing user
            return new User(users[0]);
        }

        return this._findAll({ id });
    }

    public static async create({ serverId, id }: { serverId: Server['id'], id: User['id'] }) {
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

    public async setDisplayName(displayName?: string) {
        if (displayName) {
            if (!this.displayName || this.displayName !== displayName) {
                // Update local cache
                this.displayName = displayName;

                // Update database
                await database.query<User>(sql`UPDATE users SET displayName=${displayName} WHERE serverId=${this.serverId} AND id=${this.id}`);
            }
        }
    }

    public async setDisplayImage(displayImage?: string) {
        if (displayImage) {
            if (!this.displayImage || this.displayImage !== displayImage) {
                // Update local cache
                this.displayImage = displayImage;

                // Update database
                await database.query<User>(sql`UPDATE users SET displayImage=${displayImage} WHERE serverId=${this.serverId} AND id=${this.id}`);
            }
        }
    }

    public async processUserExperience(message: Message) {
        const server = await Server.findOrCreate({ id: this.serverId });
        const userExperience = new UserExperience(server, this, message);
        await userExperience.process().catch(error => {
            console.log(error);
        });
    }

    public async processMessage(message: Message) {
        // Non text channel
        if (!isTextChannelMessage(message)) {
            return;
        }

        // Update our cache with the user's display name and image
        await this.setDisplayName(message.guild?.members.cache.get(this.id)?.displayName || message.guild?.members.cache.get(this.id)?.user.username);
        await this.setDisplayImage(message.guild?.members.cache.get(this.id)?.user.displayAvatarURL({ format: 'png' }));

        // Handle user experience
        await this.processUserExperience(message);

        // Get current server
        const server = await Server.findOrCreate({ id: this.serverId });

        // Skip messages without our prefix
        if (!message.content.startsWith(server.prefix)) return;

        // Silence the output
        let silent = false;
        if (message.content.startsWith(server.prefix + '$')) {
            // Enable silent mode
            silent = true;
        }

        // Log full message
        log.debug(`[${message.author.tag}]: ${message.content}`);

        const _commandBody = message.content.slice(silent ? server.prefix.length + 1 : server.prefix.length);
        const commandBody = _commandBody.split('\n')[0];
        const args = commandBody.split(' ');
        const commandName = args.shift()?.toLowerCase()?.trim();
        const mutlilineCommand = _commandBody.split('\n').length >= 2;

        try {
            // Bail if there's no command given
            if (!commandName) {
                return;
            }

            // Bail if the command isn't valid
            const command = getCommand(isCommandAlias(server, commandName) ? server.aliases[commandName] : commandName);
            if (!command) {
                throw new InvalidCommandError(server.prefix, commandName, args);
            }

            // Don't allow multi-line commands
            if (mutlilineCommand) {
                throw new MultiLinePermissionError();
            }

            // Don't check permissions if this is the owner of the bot
            if (envs.OWNER.ID !== message.member?.id) {
                // Check we have permission to run this
                if (!message.member?.roles.cache.some(role => command.roles.includes(role.name))) {
                    throw new CommandPermissionError(server.prefix, commandName);
                }
            }

            // Ensure we have the right amount of args
            if (command.arguments?.minimum !== undefined || command.arguments?.maximum !== undefined) {
                if (args.length < command.arguments.minimum) {
                    throw new AppError('Not enough args, %s requires at least %s args.', command.name, command.arguments.minimum);
                }

                if (args.length > command.arguments.maximum) {
                    throw new AppError('Too many args, %s requires no more than %s args.', command.name, command.arguments.maximum);
                }
            }

            // Run the command
            const commandPromise = Promise.resolve(command.handler(server.prefix, message, args));
            const result = await promiseTimeout(commandPromise, command.timeout ?? FIVE_SECONDS);

            // No output
            if (!result) {
                throw new AppError('No command output');
            }

            // If result is a string and starts with a capital
            if (typeof result === 'string' && !result.startsWith('http') && /^[a-z]/.test(result)) {
                log.warn(`Command output started with a lowercase "${result}".`);
            }

            // Skip output
            if (silent) return;

            // Respond with command output
            await message.channel.send(result as string);
        } catch (error) {
            // Reply with error
            if (process.env.DEBUG) {
                // Show debugging to owner
                if (envs.OWNER.ID === message.member?.id) {
                    await message.channel.send('```json\n' + JSON.stringify(error, null, 2) + '\n```');
                    return;
                }
            }

            log.error(error);
            await message.channel.send(error.message);
        }
    }
};
