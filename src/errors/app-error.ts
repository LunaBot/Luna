import { envs } from '@/envs';
import { MessageEmbed } from 'discord.js';
import { format } from 'util';

/**
 * Generic application error.
 */
export class AppError extends Error {
	public name = 'AppError';

	/** HTTP status code */
	public code = 500;

	constructor(message: Error);
	constructor(message: string, ...args: any[]);
	constructor(message: any, ...args: any[]) {
		// Calling parent constructor of base Error class.
		super(message instanceof Error ? message.message : format(message, ...args));

		// Saving class name in the property of our custom error as a shortcut.
		this.name = this.constructor.name;

		// Capturing stack trace, excluding constructor call from it.
		Error.captureStackTrace(this, this.constructor);

		// Set the prototype explicitly.
        Object.setPrototypeOf(this, AppError.prototype);
	}

	/** Set the HTTP status code. */
	setCode(code: number) {
		this.code = code;
	}

	/**
	 * Convert error to JSON format.
	 */
	toJSON() {
		return {
			error: {
				name: this.name,
				message: this.message,
				stacktrace: this.stack
			}
		};
	}

	/**
	 * Convert error to Discord embed.
	 */
	toEmbed() {
		const errorEmbed = new MessageEmbed({
			author: {
				name: 'Error',
			},
			fields: [{
				name: 'Message',
				value: this.message,
			}]
		});
	
		if (envs.DEBUG && this.stack) {
			errorEmbed.addField('Stacktrace', '```ts\n' + this.stack + '\n```');
		}

		return errorEmbed;
	}
};
