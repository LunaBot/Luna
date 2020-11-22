import path from 'path';
import { loadJsonFile } from './utils';

interface config {
    BOT_TOKEN: string;
    OWNER: {
        ID: string;
        SERVER: string;
    };
}

// @ts-ignore
export const config: config = loadJsonFile(path.resolve(__dirname, '..', 'config.json'));
// export const config: typeof import('../config.json') = loadJsonFile(path.resolve(__dirname, '..', 'config.json'));
