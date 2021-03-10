import type { GuildFeatures, Collection} from 'discord.js';
import type Enmap from 'enmap';
import type { Command } from '../command';
import type { Logger } from 'logger';
import type { Module } from '../module';

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>;
        settings: Enmap<string, any>;
        logger: Logger;
        modules: Collection<string, Module>;
    }
    export interface GuildMember {
		pending: boolean;
	}
    export interface Message {
        startedProcessingTimestamp: Date;
    }
}
