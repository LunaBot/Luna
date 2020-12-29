import { sql } from '@databases/pg';
import dedent from 'dedent';
import { Request, Response } from 'express';
import router from 'express-promise-router';
import fs from 'fs';
import { join as joinPath } from 'path';
import Vue from 'vue';
import { createRenderer } from 'vue-server-renderer';
import { database } from '../database';
import { envs } from '../envs';
import { AppError } from '../errors';
import { Server } from '../servers';
import { User } from '../user';

const createVueEndpoint = ({
    templatePath,
    app,
    context = {}
}: {
    templatePath?: string,
    app: Vue,
    context: {}
}) => {
    const template = templatePath ? fs.readFileSync(templatePath, 'utf-8') : dedent`
        <html>
            <head>
                <meta charset="utf-8">
                <title>{{ title }}</title>
                <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body>
                <!--vue-ssr-outlet-->
            </body>
        </html>
    `;
    return (_request: Request, response: Response) => {
        return createRenderer({
            template,
        }).renderToString(app, context, (error, html) => {
            if (error) {
                response.status(500).end(envs.NODE_ENV === 'production' ? 'Internal Server Error' : error.message);
                return;
            }
            response.end(html);
        });
    };
};

const frontend = router();

// Home page
frontend.get('/', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

// User profile
frontend.get('/profile/:userId', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

// Server selection
frontend.get('/dashboard', (request, response) => {
    return createVueEndpoint({
        app: new Vue({
            data: {
                url: request.url
            },
            template: `<div>Coming soon...</div>`,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
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
frontend.get('/leaderboard/:serverId', async (request, response) => {
    const serverId = request.params.serverId;
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

    // Leaderboards
    const positiveLeaderboardUsers = leaderboard.filter(user => user.experience >= 0);
    const negativeLeaderboardUsers = leaderboard.filter(user => user.experience < 0);

    const LeaderboardRow = Vue.component('leaderboard-row', {
        data() {
            return {
                fallbackImage: 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png'
            };
        },
        props: {
            rank: Number,
            user: {},
        },
        template: dedent`
            <tr class="text-center bg-white border-4 border-gray-200">
                <td>
                    <span class="font-semibold">#{{ rank }}</span>
                </td>
                <td>
                    <img class="h-8 w-8 rounded-full object-cover inline" :src="user.displayImage || fallbackImage" alt="" />
                    <span class="ml-2 font-semibold" v-html="user.displayName || user.id"></span>
                </td>
                <td class="px-16 py-2">
                    <span>{{ user.experience }}</span>
                </td>
                <td class="px-16 py-2">
                    <span>{{ user.level }}</span>
                </td>
            </tr>
        `
    });
    const Leaderboard = Vue.component('leaderboard', {
        components: {
            LeaderboardRow
        },
        props: {
            title: String,
            users: Array
        },
        template: dedent`
            <div class="p-8">
                <h1 class="text-3xl">{{ title }}</h1>
                <table class="min-w-full table-auto">
                    <thead class="justify-between">
                        <tr class="bg-gray-800">
                            <th class="px-16 py-2">
                                <span class="text-gray-300">Rank</span>
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
                        <leaderboard-row v-for="(user, index) in users" :key="user.id" v-bind="{ rank: index, user }" />
                    </tbody>
                </table>
            </div>
        `
    });
    return createVueEndpoint({
        app: new Vue({
            data() {
                return {
                    positiveLeaderboardUsers,
                    negativeLeaderboardUsers,
                };
            },
            components: {
                Leaderboard,
            },
            template: `
            <div>
                <leaderboard v-bind="{ title: 'Top members!', users: positiveLeaderboardUsers }" />
                <leaderboard v-bind="{ title: 'Salty bitches!', users: negativeLeaderboardUsers }" />
            </div>
            `,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

// Health
frontend.get('/health', (_req, res) => {
    res.send('OK');
});

export {
    frontend
};
