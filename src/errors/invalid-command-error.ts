import { AppError } from './app-error';

/**
 * Invalid command error.
 */
export class InvalidCommandError extends AppError {
	public name = 'InvalidCommandError';

	constructor(public prefix: string, public command: string, public args?: string[]) {
		super(`Invalid command \`${prefix}${command}\``);
	}
};
