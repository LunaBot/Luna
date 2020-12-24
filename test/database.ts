import createConnectionPool from '@databases/pg';
import { config } from '../src/config';

export const database = createConnectionPool(config.CONNECTION_STRING);

async function run() {

}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

// import fs from 'fs';
// import path from 'path';
// import { Pool } from 'pg';
// import { config } from './config';

// const ca = fs.readFileSync(path.resolve('ca-certificate.crt')).toString();

// export const database = new Pool({
//     max: 20,
//     connectionString: config.CONNECTION_STRING,
//     idleTimeoutMillis: 30000,
//     ssl: {
//         rejectUnauthorized: false,
//         ca
//     }
// });

// // https://github.com/brianc/node-postgres/blame/afb3bf3d4363d0696f843a008a78576434496eee/packages/pg/lib/connection-parameters.js#L56
// // Issue is new commit uses connectionString which removes { ssl: { rejectUnauthorised: false } }
// // database.ssl

// database.on('error', (error) => {
//     console.log(error);
// });