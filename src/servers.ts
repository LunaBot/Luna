import fs from 'fs';
import path from 'path';
import { loadJsonFile } from './utils';

interface Server {
    prefix: string;
    commands: {
        [key: string]: {
            roles: string[];
        }
    }
    channels: {
        botCommands: string;
    }
}

type Servers = {
    [key: string]: Server;
};

const serversFilePath = path.resolve(__dirname, '..', 'servers.json');

const servers: Servers = loadJsonFile(serversFilePath, {
    default: {
        prefix: '!',
        commands: {
            help: {
                roles: ['@everyone']
            }
        },
        channels: {
            botCommands: ''
        }
    }
});

export const serversCount = Object.keys(servers).length - 1;

export const getServer = (serverId: string): Server => {
    if (!Object.keys(servers).includes(serverId)) {
        servers[serverId] = servers.default;
    }

    return servers[serverId];
};

export const saveServers = () => {
    fs.writeFileSync(serversFilePath, JSON.stringify(servers, null, 2));
};
