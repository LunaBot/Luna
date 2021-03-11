import Statcord from 'statcord.js';
import dotEnv from 'dotenv';
import { client } from './client';

// Load env values
dotEnv.config();

// Create statcord client
const statcord = new Statcord.Client({
    client,
    key: process.env.STATCORD_API_KEY!,
    postCpuStatistics: true, /* Whether to post memory statistics or not, defaults to true */
    postMemStatistics: true, /* Whether to post memory statistics or not, defaults to true */
    postNetworkStatistics: true, /* Whether to post memory statistics or not, defaults to true */
});

statcord.on('autopost-start', () => {
    // Emitted when statcord autopost starts
    client.logger.info('Started statcord autoposter!');
});

statcord.on('post', status => {
    if (!status) return;
    if (status === true) return;

    client.logger.error(status);
});

export {
    statcord
};
