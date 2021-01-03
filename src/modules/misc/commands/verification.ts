import { sql } from '@databases/pg';
import { v4 } from 'uuid';
import { Command } from '@/command';
import { database } from '@/database';
import { AppError } from '@/errors';
import { isTextChannelMessage, TextMessage } from '@/guards';
import type { Message } from 'discord.js';

export class Verification extends Command {
    public name = 'Verification';
    public command = 'verification';
    public timeout = 5000;
    public description = 'Manage verification channels.';
    public hidden = false;
    public owner = true;
    public examples = [
        // Create command
        '!verification create-command nsfw',

        // Match message to string
        '!verification set-message nsfw agree',

        // Require profile image
        '!verification set-profile-image-required nsfw true',

        // Match message to Regex
        '!verification set-success-regex nsfw /^(?:1[01][0-9]|120|1[7-9]|[2-9][0-9])$/',
        '!verification set-failed-regex nsfw /^([1-9]|1[01234567])$/',

        // Set success/failure/error repies
        '!verification set-success-message nsfw "Try again, reply with just your age and nothing else."',
        '!verification set-failed-message nsfw "You\'re underage, come back when you\'re 18+."',
        '!verification set-error-message nsfw "Try again, reply with just your age and nothing else."',

        // Set roles
        '!verification set-success-role nsfw +over18',
        '!verification set-failed-role nsfw +under18,-member',

        // Set channels
        '!verification set-announce-channel nsfw #the-lounge',
        '!verification set-allowed-channels nsfw #welcome',
        '!verification set-allowed-channel-regex nsfw /^nsfw-ticket-[0-9]+$/',

        // Enable/disable
        '!verification enable nsfw',
    ];
    public roles = [];

    private subCommands = {
        // Create command
        'create-command': (serverId: string, command: string, _prefix: string, _message: TextMessage, _args: string[]) => this.createCommand(serverId, command),

        // Match message to string
        'set-message': (serverId: string, command: string, _prefix: string, _message: TextMessage, _args: string[]) => this.setMessage(serverId, command, args[1]),

        // Require profile image
        // '!verification set-profile-image-required nsfw true',

        // Match message to Regex
        'set-success-regex': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setSuccessMessageRegex(serverId, command, args[1]),
        'set-failed-regex': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setFailedMessageRegex(serverId, command, args[1]),

        // Set success/failure/error repies
        'set-success-message': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setSuccessMessage(serverId, command, args[1]),
        'set-failed-message': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setFailedMessage(serverId, command, args[1]),
        'set-error-message': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setErrorMessage(serverId, command, args[1]),

        // Set roles
        'set-success-role': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setSuccessRole(serverId, command, args[1]),
        'set-failed-role': (serverId: string, command: string, _prefix: string, _message: TextMessage, args: string[]) => this.setFailedRole(serverId, command, args[1]),

        // Set channels
        'set-announce-channel': () => this.setAnnounceChannel(),
        'set-allowed-channels': () => this.addAllowedChannel(),
        'set-allowed-channel-regex': () => this.addAllowedChannelRegex(),

        // Enable/disable
        'enable': (serverId: string, command: string, _prefix: string, _message: TextMessage, _args: string[]) => this.enable(serverId, command, true),
        'disable': (serverId: string, command: string, _prefix: string, _message: TextMessage, _args: string[]) => this.enable(serverId, command, false),
    };

    /**
     * Create a new verification command.
     *
     * @private
     * @memberof Verification
     */
    private async createCommand(serverId: string, command: string) {
        await database.query(sql`INSERT INTO verifications(id,serverId,command) VALUES (${v4()},${serverId},${command});`);
        return `\`${command}\` verification created!`;
    }

    private async setMessage(serverId: string, command: string, message: string) {
        await database.query(sql`UPDATE verifications SET message=${message} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification message set to \`${message}\`!`;
    }

    private async setSuccessMessageRegex(serverId: string, command: string, regex: string) {
        await database.query(sql`UPDATE verifications SET successMessageRegex=${regex} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification success message regex set!`;
    }

    private async setFailedMessageRegex(serverId: string, command: string, regex: string) {
        await database.query(sql`UPDATE verifications SET failedMessageRegex=${regex} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification failed message regex set!`;
    }

    private async setSuccessMessage(serverId: string, command: string, message: string) {
        await database.query(sql`UPDATE verifications SET successMessage=${message} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification success message set!`;
    }

    private async setFailedMessage(serverId: string, command: string, message: string) {
        await database.query(sql`UPDATE verifications SET failedMessage=${message} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification failed message set!`;
    }

    private async setErrorMessage(serverId: string, command: string, regex: string) {
        await database.query(sql`UPDATE verifications SET failedMessageRegex=${regex} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification failed message regex set!`;
    }

    // private async setRole(serverId: string, command: string){}
    // private async setAnnounceChannel(serverId: string, command: string){}
    // private async addAllowedChannel(serverId: string, command: string){}
    // private async addAllowedChannelRegex(serverId: string, command: string){}
    private async enable(serverId: string, command: string, enabled: boolean) {
        await database.query(sql`UPDATE verifications SET enabled=${enabled} WHERE serverId=${serverId} AND command=${command};`);
        return `\`${command}\` verification ${enabled ? 'enabled' : 'disabled'}!`;
    }

    async handler(prefix: string, message: Message, args: string[]) {
        if (isTextChannelMessage(message)) {
            const subCommands = this.subCommands;
            const subCommand = args[0] as keyof typeof subCommands;

            // No sub-command
            if (!subCommand) {
                return help.handler(prefix, message, ['verification']);
            }

            if (!Object.keys(subCommands).includes(subCommand)) {
                throw new AppError('Invalid subcommand!');
            }

            // If valid sub-command, run it
            return subCommands[subCommand](message.guild.id, args[1], prefix, message, args);
        }
        
        throw new AppError('Invalid channel type');
    }
};
