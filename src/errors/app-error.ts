import { format } from 'util';

/**
 * Generic application error.
 */
export class AppError extends Error {
	/** HTTP status code */
	public code = 500;

	constructor(message: string, ...args: any[]) {
		// Calling parent constructor of base Error class.
		super(format(message, ...args));

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
};
