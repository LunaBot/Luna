import type { GuildFeatures, Collection} from 'discord.js';
import type Enmap from 'enmap';
import type { Logger } from 'logger';

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, unknown>;
        settings: Enmap<string | number, any>;
        logger: Logger;
    }
    export interface GuildMember {
		pending: boolean;
	}
}