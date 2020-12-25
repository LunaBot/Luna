import createConnectionPool from '@databases/pg';
import { config } from './config';

export const database = createConnectionPool({
    connectionString: config.CONNECTION_STRING,
    idleTimeoutMilliseconds: 0,
    maxUses: 20,
});
