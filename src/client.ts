import { Client, Structures, Collection } from 'discord.js';
import Enmap from 'enmap';
import { logger } from './logger';

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

const defaultSettings = {
  prefix: '!',
  modLogChannel: 'audit-log',
  modRole: 'Mod',
  adminRole: 'Admin',
  welcomeChannel: 'welcome',
  welcomeMessage: 'Say hello to {user}, everyone!'
};

client.settings = new Enmap({
	name: 'settings',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	// @ts-expect-error
	autoEnsure: defaultSettings
});

client.commands = new Collection();

client.logger = logger;

export {
    client,
    defaultSettings
};
