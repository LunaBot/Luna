export const envs = {
    BOT_TOKEN: process.env.BOT_TOKEN ?? '',
    OWNER: {
        ID: process.env.OWNER_ID ?? '',
        SERVER: process.env.OWNER_SERVER ?? ''
    },
    DATABASE: {
        USERNAME: process.env.DATABASE_USERNAME ?? '',
        PASSWORD: process.env.DATABASE_PASSWORD ?? '',
        HOSTNAME: process.env.DATABASE_HOSTNAME ?? '',
        PORT: process.env.DATABASE_PORT ?? '',
        DATABASE_NAME: process.env.DATABASE_NAME ?? '',
        CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING ?? '',
    }
};

export type Envs = typeof envs;
