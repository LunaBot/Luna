declare module 'parse-human-date' {
    export default function parseHumanDate(input: string, options?: {
        now: number;
    }): Date;
};

declare module 'ml-sentiment';