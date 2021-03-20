import { Client, Collection, Message, PermissionString } from 'discord.js';
import { paramCase } from 'change-case';
import { EnumeratableClass } from '@lunabot/kaspar/utils';

interface Options {
    name?: string;
    command?: string;
    trigger?: string;
    description?: string;
};

export abstract class Command extends EnumeratableClass {
    public name: string;
    public command: string;
    public triggers: string[];
    public description?: string;
    public userPermissions: PermissionString[] = [];
    public clientPermissions: PermissionString[] = [];
    public paramaters?: Collection<string, { type: 'string' | 'boolean' | 'number' | 'member' | 'role' | 'channel'; optional?: boolean; }> = new Collection();

    public static PERMISSIONS = {
        CREATE_INSTANT_INVITE: 'CREATE_INSTANT_INVITE' as const,
        KICK_MEMBERS: 'KICK_MEMBERS' as const,
        BAN_MEMBERS: 'BAN_MEMBERS' as const,
        ADMINISTRATOR: 'ADMINISTRATOR' as const,
        MANAGE_CHANNELS: 'MANAGE_CHANNELS' as const,
        MANAGE_GUILD: 'MANAGE_GUILD' as const,
        ADD_REACTIONS: 'ADD_REACTIONS' as const,
        VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG' as const,
        PRIORITY_SPEAKER: 'PRIORITY_SPEAKER' as const,
        STREAM: 'STREAM' as const,
        VIEW_CHANNEL: 'VIEW_CHANNEL' as const,
        SEND_MESSAGES: 'SEND_MESSAGES' as const,
        SEND_TTS_MESSAGES: 'SEND_TTS_MESSAGES' as const,
        MANAGE_MESSAGES: 'MANAGE_MESSAGES' as const,
        EMBED_LINKS: 'EMBED_LINKS' as const,
        ATTACH_FILES: 'ATTACH_FILES' as const,
        READ_MESSAGE_HISTORY: 'READ_MESSAGE_HISTORY' as const,
        MENTION_EVERYONE: 'MENTION_EVERYONE' as const,
        USE_EXTERNAL_EMOJIS: 'USE_EXTERNAL_EMOJIS' as const,
        VIEW_GUILD_INSIGHTS: 'VIEW_GUILD_INSIGHTS' as const,
        CONNECT: 'CONNECT' as const,
        SPEAK: 'SPEAK' as const,
        MUTE_MEMBERS: 'MUTE_MEMBERS' as const,
        DEAFEN_MEMBERS: 'DEAFEN_MEMBERS' as const,
        MOVE_MEMBERS: 'MOVE_MEMBERS' as const,
        USE_VAD: 'USE_VAD' as const,
        CHANGE_NICKNAME: 'CHANGE_NICKNAME' as const,
        MANAGE_NICKNAMES: 'MANAGE_NICKNAMES' as const,
        MANAGE_ROLES: 'MANAGE_ROLES' as const,
        MANAGE_WEBHOOKS: 'MANAGE_WEBHOOKS' as const,
        MANAGE_EMOJIS: 'MANAGE_EMOJIS' as const
    };

    constructor(public options: Options = {}) {
        super();

        this.name = paramCase(options.name ?? this.constructor.name);
        this.command = options.command ?? paramCase(this.name);
        this.triggers = ['{prefix}{command} {args}'];
    }

    /**
     * Initalise the command
     */
    init?(client: Client): void {};

    /**
     * Get the help text in this current context
     */
    getHelpText(client: Client, message: Message, args: string[]): string {
        return this.description ?? 'No description found.';
    }

    /**
     * Main command method
     */
    run(client: Client, message: Message, args: string[]): void {
        throw new Error('Method not implemented.');
    }
}
