import { Client, Structures, Collection } from 'discord.js';
import Enmap from 'enmap';
import { logger } from './logger';
import * as moduleImports from './modules';
import dotEnv from 'dotenv';
import { createClient as createStatsClient } from '@lunabot/stats';

Structures.extend('GuildMember', GuildMember => class GuildMemberWithPending extends GuildMember {
    pending = false;

    constructor(client: any, data: any, guild: any) {
        super(client, data, guild);
        this.pending = data.pending ?? false;
    }

    _patch(data: any) {
        // @ts-expect-error
        super._patch(data);
        this.pending = data.pending ?? false;
    }
});

const client = new Client();

client.ownerID = process.env.BOT_OWNER ?? '107834314439294976';
client.modules = new Collection(Object.values(moduleImports).map(commandModule => [commandModule.name, commandModule]));
client.commands = new Collection();
client.logger = logger;

const defaultCustomer = {
    membership: 'free',
    banned: false
};

client.customers = new Enmap({
	name: 'customers',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	// @ts-expect-error
	autoEnsure: defaultCustomer
});

const defaultSettings = {
    prefix: '!',
    roles: {
        admin: 'Admin',
        mod: 'Mod',
        muted: 'Muted',
    },
    admin: {
        enabled: true
    },
    auditLog: {
        enabled: false,
        channel: 'audit-log',
        events: ['messageUpdate']
    },
    autoRole: {
        enabled: false,
    },
    bot: {
        enabled: true
    },
    community: {
        enabled: false
    },
    leveling: {
        enabled: true,
        announcement: {
            enabled: false,
            channel: 'dm'
        }
    },
    moderation: {
        enabled: true
    },
    walkieTalkie: {
        enabled: false,
        channel: ''
    },
    welcome: {
        enabled: false,
        channel: 'welcome',
        message: 'Say hello to {user}, everyone!',
    }
};

client.settings = new Enmap({
	name: 'settings',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	// @ts-expect-error
	autoEnsure: defaultSettings
});

const defaultWalkieTalkie = {
    enabled: true,
    id: '',
    token: ''
};

client.walkieTalkies = new Enmap({
	name: 'walkieTalkies',
	fetchAll: true,
	autoFetch: true,
	cloneLevel: 'deep',
	// @ts-expect-error
	autoEnsure: defaultWalkieTalkie
});

client.points = new Enmap({
    name: 'points',
    fetchAll: true,
	autoFetch: true,
	cloneLevel: 'deep'
});

// Load .env file
dotEnv.config();

// Create stats client
export const statsClient = createStatsClient({
    apiKey: process.env.STATS_API_KEY!,
    clientID: process.env.CLIENT_ID!,
    client,
    silent: false
});

// @ts-expect-error
statsClient.log = (level, message, ...optionalParams) => {
    if (statsClient.options.silent) return;
    logger[level](message, ...optionalParams);
}

export {
    client,
    defaultSettings,
    defaultWalkieTalkie,
    defaultCustomer
};
