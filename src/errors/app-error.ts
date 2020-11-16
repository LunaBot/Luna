/**
 * Generic application error.
 */
export class AppError extends Error {
	constructor(message: string) {
		// Calling parent constructor of base Error class.
		super(message);

		// Saving class name in the property of our custom error as a shortcut.
		this.name = this.constructor.name;

		// Capturing stack trace, excluding constructor call from it.
		Error.captureStackTrace(this, this.constructor);

		// Set the prototype explicitly.
        Object.setPrototypeOf(this, AppError.prototype);
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
