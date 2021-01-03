import { database } from '@/database';
import { AppError } from '@/errors';
import { Server } from '@/servers';
import { User } from '@/user';
import { createVueEndpoint } from '@/utils';
import { sql } from '@databases/pg';
import dedent from 'dedent';
import router from 'express-promise-router';
import Vue from 'vue';

const leaderboards = router();

// Leaderboards
leaderboards.get('/leaderboard/:serverId', async (request, response) => {
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
                        <leaderboard-row v-for="(user, index) in users" :key="user.id" v-bind="{ rank: index + 1, user }" />
                    </tbody>
                </table>
            </div>
        `
    });
    return createVueEndpoint({
        app: new Vue({
            name: 'App',
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
            <div id="app">
                <leaderboard v-bind="{ title: 'Top members!', users: positiveLeaderboardUsers }" />
                <leaderboard v-if="negativeLeaderboardUsers.length >= 1" v-bind="{ title: 'Salty bitches!', users: negativeLeaderboardUsers }" />
            </div>
            `,
        }),
        context: {
            title: 'Automod',
        }
    })(request, response);
});

export {
    leaderboards
};