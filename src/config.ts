import fs from 'fs';
import path from 'path';
import { loadJsonFile } from './utils';

export const config = loadJsonFile(path.resolve(__dirname, '..', 'config.json'));
