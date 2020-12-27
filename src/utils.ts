import fs from 'fs';
import type { Command } from './command';

export const getCommandHelp = (prefix: string, command: Command) => {
	return {
		name: `\`${prefix}${command.command}\``,
		value: command.description
	};
};

export const loadJsonFile = (fileLocation: string, object?: object) => {
    try {
        const file = fs.readFileSync(fileLocation).toString();
        return JSON.parse(file);
    } catch (error) {
        // Missing file
        if (error.code === 'ENOENT') {
			if (object) {
				fs.writeFileSync(fileLocation, JSON.stringify(object, null, 2));
				return object;
			}
            throw new Error(`Config file missing at ${fileLocation}`);
        }

        // Other error
        throw error;
    }
};

export const promiseTimeout = (promise: Promise<any>, ms: number) => {
	// Create a promise that rejects in <ms> milliseconds
	const timeout = new Promise((_resolve, reject) => {
	  const id = setTimeout(() => {
		clearTimeout(id);
		reject(`Timed out in ${ms}ms.`);
	  }, ms);
	});
  
	// Returns a race between our timeout and the passed in promise
	return Promise.race([
	  promise,
	  timeout
	]);
};