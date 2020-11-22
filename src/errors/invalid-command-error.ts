import { AppError } from './app-error';

/**
 * Invalid command error.
 */
export class InvalidCommandError extends AppError {
	constructor(prefix: string, commandName: string, args?: string[]) {
		if (args) {
			super(`invalid command \`${prefix}${commandName}${args.length >= 1 ? ' ' + args.join(' ') : ''}\``);
		} else {
			super(`invalid command \`${prefix}${commandName}\``);
		}
	}
};
