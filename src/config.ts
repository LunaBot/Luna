interface config {
    BOT_TOKEN?: string;
    OWNER: {
        ID?: string;
        SERVER?: string;
    };
}

export const config: config = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    OWNER: {
        ID: process.env.OWNER_ID,
        SERVER: process.env.OWNER_SERVER
    }
};
