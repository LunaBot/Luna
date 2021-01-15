declare module 'parse-human-date' {
    export default function parseHumanDate(input: string, options?: {
        now: number;
    }): Date;
};

declare module 'ml-sentiment';

declare module 'discord.js' {
    interface Interaction {
        id: string;
        channel: TextChannel;
        guild: Guild;
        member: GuildMember | null;
        author: User | null;
        name: string;
        content: string;
        createdTimestamp: number;
        options: { value: string; name: string }[] | null;
    }
}

// Add discord "user" to request.user
declare namespace Express {
    export interface Request {
        user?: import('passport-discord').Profile;
    }
}