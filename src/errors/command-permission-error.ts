import { AppError } from './app-error';

/**
 * Command permission error.
 */
export class CommandPermissionError extends AppError {
	constructor(commandName: string) {
		super(`You don't have access to \`!${commandName}\``);
	}
};
