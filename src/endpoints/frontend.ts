import { sql } from '@databases/pg';
import router from 'express-promise-router';
import { database } from '../database';
import { AppError } from '../errors';
import { Server } from '../servers';
import { User } from '../user';
import { Leaderboard } from '../commands/leaderboards';
import dedent from 'dedent';

const frontend = router();

// Home page
frontend.get('/', (_req, res) => {
    res.send('Coming soon...');
});

// User profile
frontend.get('/profile/:userId', (_req, res) => {
    res.send('Coming soon...');
});

// Server selection
frontend.get('/dashboard', (_req, res) => {
    res.send('Coming soon...');
});

// Dashboards
frontend.get('/dashboard/:serverId', async (req, res) => {
    const serverId = req.params.serverId;
    const server = await Server.find({ id: serverId });
    if (!server) {
        throw new AppError('Invalid server ID');
    }

    res.send(`Welcome to ${serverId}`);
});

// Leaderboards
frontend.get('/leaderboard/:serverId', async (req, res) => {
    const serverId = req.params.serverId;
    const server = await Server.find({ id: serverId });
    if (!server) {
        throw new AppError('Invalid server ID');
    }

    // Top 100 users
    const users = await database.query<User>(sql`SELECT * FROM users WHERE serverId=${serverId} ORDER BY experience DESC LIMIT 100;`).then(users => {
        return users.map(user => new User(user));
    });
    const leaderboard = Object.values(users).sort((userA, userB) => {
        if (userA.experience < userB.experience) return 1;
        if (userA.experience > userB.experience) return -1;
        return 0;
    });
    const positiveLeaderboardUsers = leaderboard.filter(user => user.experience >= 0);
    const negativeLeaderboardUsers = leaderboard.filter(user => user.experience < 0);

    const createLeaderboardHtml = (title: string, users: User[]) => {
        return `<div class="p-8">
            <h1 class="text-3xl">${title}</h1>
            <table class="min-w-full table-auto">
                <thead class="justify-between">
                    <tr class="bg-gray-800">
                        <th class="px-16 py-2">
                            <span class="text-gray-300"></span>
                        </th>
                        <th class="px-16 py-2">
                            <span class="text-gray-300">Name</span>
                        </th>
                        <th class="px-16 py-2">
                            <span class="text-gray-300">Experience</span>
                        </th>
                        <th class="px-16 py-2">
                            <span class="text-gray-300">Level</span>
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-gray-200">
                    ${users.map(user => {
                        return `<tr class="bg-white border-4 border-gray-200">
                            <td class="px-16 py-2 flex flex-row items-center">
                                <img class="h-8 w-8 rounded-full object-cover" src="https://randomuser.me/api/portraits/women/10.jpg" alt="" />
                            </td>
                            <td>
                                <span class="text-center ml-2 font-semibold">${user.id}</span>
                            </td>
                            <td class="px-16 py-2">
                                <span class="text-center">${user.experience}</span>
                            </td>
                            <td class="px-16 py-2">
                                <span class="text-center">${user.level}</span>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
    }


    res.send(`
    <html>
        <head>
            <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
            ${createLeaderboardHtml('Top members!', positiveLeaderboardUsers)}
            ${createLeaderboardHtml('Salty bitches!', negativeLeaderboardUsers)}
        </body>
    </html>
    `);
});

// Health
frontend.get('/health', (_req, res) => {
    res.send('OK');
});

export {
    frontend
};
