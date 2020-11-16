import { AppError } from './app-error';
import { getStore } from '../store';

/**
 * Invalid command error.
 */
export class InvalidCommandError extends AppError {
	constructor(commandName: string, args?: string[]) {
		const store = getStore('default');
		if (args) {
			super(`invalid command \`${store.prefix}${commandName}${args.length >= 1 ? ' ' + args.join(' ') : ''}\``);
		} else {
			super(`invalid command \`${store.prefix}${commandName}\``);
		}
	}
};
