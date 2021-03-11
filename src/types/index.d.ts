import type { GuildFeatures, Collection} from 'discord.js';
import type Enmap from 'enmap';
import type { Command } from '../command';
import type { Logger } from '../logger';
import type { Module } from '../module';
import { defaultSettings, defaultCustomer, defaultWalkieTalkie } from '../client';

declare module "discord.js" {
    export interface Client {
        // Runtime
        ownerID: string;
        modules: Collection<string, Module>;
        commands: Collection<string, Command>;
        logger: Logger;

        // Database
        settings: Enmap<string, typeof defaultSettings>;
        customers: Enmap<string, typeof defaultCustomer>;
        walkieTalkies: Enmap<string, typeof defaultWalkieTalkie>;
        points: Enmap<string, any>;
    }
    export interface GuildMember {
		pending: boolean;
	}
    export interface Message {
        startedProcessingTimestamp: Date;
    }
}
