import type { GuildFeatures, Collection} from 'discord.js';
import type Enmap from 'enmap';

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, unknown>;
        settings: Enmap<string | number, any>;
        logger: Console;
    }
    export interface GuildMember {
		pending: boolean;
	}
}