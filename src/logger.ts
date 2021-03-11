import chalk from 'chalk';
import getHex from 'number-to-color/hexMap.js';
import stringToColour from 'string-to-color';

const levels = ['error', 'warn', 'info', 'debug', 'trace', 'silly'] as const;
const transports = ['console', 'syslog'] as const;

interface Options {
    prefix: string;
    prefixes: string[];
    prefixSeperator: string;
    syslogTag: string;
    syslogPath: string;
    console: typeof console;
    level: typeof levels[number];
    transport: typeof transports[number];
}

export class Logger {
    private prefixes: string[] = [];
    private prefixSeperator = '/';
    private console: typeof console;
    private mapping: {
        [key: string]: 'error' | 'warn' | 'info' | 'debug' | 'trace'
    } = {
        error: 'error',
        warn: 'warn',
        info: 'info',
        debug: 'debug',
        trace: 'trace',
        silly: 'debug'
    };

    public level = (process.env.LOG_LEVEL ?? 'info') as typeof levels[number];
    public levels = levels;

    constructor(options: Partial<Options> = {}) {
         // Set prefixes
         this.prefixes = [
            ...(options.prefixes ? options.prefixes : []),
            ...(options.prefix ? [options.prefix] : [])
        ];

        // Allow options to override defaults
        this.console = options.console ?? console;
        this.prefixSeperator = options.prefixSeperator ?? this.prefixSeperator;
    }

    private colour(level: typeof levels[number]) {
        return getHex(this.levels.indexOf(level) / this.levels.length);
    }

    private addColourToString(hex: string, string: string) {
        return chalk.hex(hex)(string);
    }

    log(level: typeof levels[number], message: string, args: any[]) {
        // Only enable logging when `this.level >= level`.
        if (this.levels.indexOf(this.level) >= this.levels.indexOf(level)) {
            this._log(level, message, args);
        }
    }
    
    private _log(level: typeof levels[number], message: string, args: any[]) {
        const mappedLevel = this.mapping[level];
        const _level = `[${this.addColourToString(this.colour(level), level)}]`;
        const _prefix = this.prefixes.map(prefix => this.addColourToString(stringToColour(prefix), prefix)).join(this.prefixSeperator);
        const _formattedPrefix = `[${_prefix}]: `;
        const _message = `${_level} ${this.prefixes.length >= 1 ? _formattedPrefix : ''}${message}`;
        this.console[mappedLevel].call(this.console, _message, ...args);
    }

    createChild(options: Partial<Options> = {}) {
        return new Logger({
            ...options,
            prefixes: [
                ...(this.prefixes || []),
                ...(options.prefixes || [])
            ]
        });
    }

    debug(message: string, ...args: any[]): void {
        this.log('debug', message, args);
    }

    info(message: string, ...args: any[]): void {
        this.log('info', message, args);
    }

    warn(message: string, ...args: any[]): void {
        this.log('warn', message, args);
    }

    error(message: Error): void;
    error(message: string, ...args: any[]): void;
    error(message: any, ...args: any[]): void {
        this.log('error', message.stack, args);
    }

    trace(message: string, ...args: any[]): void {
        this.log('trace', message, args);
    }

    silly(message: string, ...args: any[]): void {
        this.log('silly', message, args);
    }
}

export const logger = new Logger();
