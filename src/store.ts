import fs from 'fs';
import path from 'path';
import { loadJsonFile } from './utils';

interface Store {
    prefix: string;
    commands: {
        [key: string]: {
            roles: string[];
        }
    }
}

const storeFilePath = path.resolve(__dirname, '..', 'store.json');

const stores: { [key: string]: Store } = loadJsonFile(storeFilePath, {
    default: {
        prefix: '!',
        commands: {
            help: {
                roles: ['@everyone']
            }
        }
    }
});

export const getStore = (storeName: string): Store => {
    if (!Object.keys(stores).includes(storeName)) {
        stores[storeName] = stores.default;
    }

    return stores[storeName];
};

export const saveStore = () => {
    fs.writeFileSync(storeFilePath, JSON.stringify(stores, null, 2));
};
