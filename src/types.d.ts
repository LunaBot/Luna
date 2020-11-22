import { Message, APIMessageContentResolvable, MessageOptions, MessageAdditions } from 'discord.js';

export interface Command {
    name: string;
    command: string;
    /**
     * How long this command should wait in <ms> before timing out
     */
    timeout: number;
    description: string;
    /**
     * Which server roles have access
     */
    roles: string[];
    /**
     * If the command is hidden in the help/commands output
     */
    hidden: boolean;
    /**
     * If the command is only for the owner of the bot
     * This will be hidden and unusable for even server owners
     */
    owner: boolean;
    handler(prefix: string, message: Message, args: string[]): Promise<APIMessageContentResolvable | (MessageOptions & { split?: false }) | MessageAdditions>;
};
