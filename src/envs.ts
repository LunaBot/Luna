export const envs = {
    API: {
        PORT: process.env.API_PORT ?? 52952,
    },
    BOT_TOKEN: process.env.BOT_TOKEN ?? '',
    DATABASE: {
        CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING ?? '',
        DATABASE_NAME: process.env.DATABASE_NAME ?? '',
        HOSTNAME: process.env.DATABASE_HOSTNAME ?? '',
        PASSWORD: process.env.DATABASE_PASSWORD ?? '',
        PORT: process.env.DATABASE_PORT ?? '',
        USERNAME: process.env.DATABASE_USERNAME ?? '',
    },
    FRONTEND: {
        PORT: process.env.FRONTEND_PORT ?? 53953,
    },
    OWNER: {
        ID: process.env.OWNER_ID ?? '',
        SERVER: process.env.OWNER_SERVER ?? '',
    },
};

export type Envs = typeof envs;
