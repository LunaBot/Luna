import ava, { TestInterface } from 'ava';
import { sql } from '@databases/pg';
import { stub, fake, } from 'sinon';
import type { Message } from 'discord.js';
import { ImportMock } from 'ts-mock-imports';
import * as envs from '../../src/envs';

const test = ava as TestInterface<{
}>;

test.beforeEach(async () => {
	ImportMock.mockOther(envs, 'envs', {
		DATABASE: {
			CONNECTION_STRING: '',
			DATABASE_NAME: 'db',
			HOSTNAME: 'localhost',
			USERNAME: 'user',
			PASSWORD: 'pass',
			PORT: '25041',
		}
	});
	
	const database = await import('../../src/database');
	ImportMock.mockOther(database, 'database', {
		query: fake.returns([]),
	});
});

test.afterEach(() => {
	ImportMock.restore();
});

test.serial('returns level 0 for new user', async t => {
	const message = {
		send: fake(),
		author: {
			id: '123456789'
		},
		channel: {
			type: 'text'
		},
		guild: {
			id: '123456789'
		}
	};
	const args: string[] = [];

	// Mock database
	const database = await import('../../src/database');
	ImportMock.mockOther(database, 'database', {
		query: fake.returns([{
			id: '123456789',
			serverId: '123456789',
			experience: 0
		}]),
	});

	// Run command
	const level = await import('../../src/commands/level').then(_import => _import.default);
	const result = await level.handler('!', message as unknown as Message, args);

	// Return a single message and never called send directly
	t.is(message.send.callCount, 0);
	t.is(result, 'Level 0. Total experience 0\nGlobal level 0. Global experience 0.');
});

test.serial('returns correct level for existing user in a single server', async t => {
	const message = {
		send: fake(),
		author: {
			id: '123456789'
		},
		channel: {
			type: 'text'
		},
		guild: {
			id: '123456789'
		}
	};
	const args: string[] = [];

	// Mock database
	const database = await import('../../src/database');
	ImportMock.mockOther(database, 'database', {
		query: fake.returns([{
			id: '123456789',
			serverId: '123456789',
			experience: 50000
		}]),
	});

	// Run command
	const level = await import('../../src/commands/level').then(_import => _import.default);
	const result = await level.handler('!', message as unknown as Message, args);

	// Return a single message and never called send directly
	t.is(message.send.callCount, 0);
	t.is(result, 'Level 43. Total experience 50000\nGlobal level 43. Global experience 50000.');
});

test.serial('returns correct level for existing user in multiple servers', async t => {
	const message = {
		send: fake(),
		author: {
			id: '123456789'
		},
		channel: {
			type: 'text'
		},
		guild: {
			id: '123456789'
		}
	};
	const args: string[] = [];

	// Mock database
	const database = await import('../../src/database');
	const users = [{
		id: '123456789',
		serverId: '123456789',
		experience: 50000
	}, {
		id: '123456789',
		serverId: '987654321',
		experience: 50000
	}];
	const query = stub();
	query.withArgs(sql`SELECT * FROM users WHERE id=${'123456789'};`).returns(users);
	query.withArgs(sql`SELECT * FROM users WHERE serverId=${'123456789'} AND id=${'123456789'};`).returns([users[0]]);
	ImportMock.mockOther(database, 'database', {
		query
	});

	// Run command
	const level = await import('../../src/commands/level').then(_import => _import.default);
	const result = await level.handler('!', message as unknown as Message, args);

	// Return a single message and never called send directly
	t.is(message.send.callCount, 0);
	t.is(result, 'Level 43. Total experience 50000\nGlobal level 86. Global experience 100000.');
});