import { AppError } from './app-error';

/**
 * Command permission error.
 */
export class CommandPermissionError extends AppError {
	public name = 'CommandPermissionError';

	constructor(prefix: string, commandName: string) {
		super(`You don't have access to \`${prefix}${commandName}\``);
	}
};
