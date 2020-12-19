import { AppError } from './app-error';

/**
 * Invalid command error.
 */
export class InvalidCommandError extends AppError {
	constructor(public prefix: string, public command: string, public args?: string[]) {
		super(`Invalid command \`${prefix}${command}\``);
	}
};
