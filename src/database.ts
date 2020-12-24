import createConnectionPool from '@databases/pg';
import { config } from './config';

export const database = createConnectionPool(config.CONNECTION_STRING);
