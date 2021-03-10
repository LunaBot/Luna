import dotEnv from 'dotenv';
import { client } from './client';
import { loadModules } from './loader';

// Load env values
dotEnv.config();

const main = async () => {
	// Load all modules, events and commands
	await loadModules(client);

	// Login to the discord bot gateway
	await client.login(process.env.BOT_TOKEN);
};

main();
