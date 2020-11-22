import util from 'util';
import chalk from 'chalk';
// @ts-ignore
import getHex from 'number-to-color/hexMap.js';
import getCurrentLine from 'get-current-line';

const levels = ['error', 'warn', 'info', 'debug', 'trace'] as const;

class Logger {
    private level = 'trace' as typeof levels[number];
    private levels = levels;
    name: string;
    timers: any;

    constructor(name: string = 'main', parentName?: string) {
        this.name = parentName ? `${parentName}/${name}` : name;
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
        const prefix = `[${this.addColourToString(this.colour(level), level)}] [${this.name}] `;
        const _message = util.format(message, ...args);
        console[level].call(console, `${prefix}${_message}`);
    }

    private _getLineInfo(offset = 0) {
        const { line: lineNumber, file } = getCurrentLine({
            frames: 3 + offset
        });
        const cwd = process.cwd();
        const filePath = file.startsWith(cwd) ? file.replace(cwd, '.') : file;
        const lineInfo = `${filePath}:${lineNumber}`;
        return `[${chalk.hex('FF4500')(lineInfo)}]`;
    }

    createChild(name: string) {
        return new Logger(name, this.name);
    }

    debug(message: string, ...args: any[]): void {
        this.log('debug', message, [...args, this._getLineInfo()]);
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
        if (message instanceof Error) {
            this.log('error', message.message, [...args, this._getLineInfo()]);
        } else {
            this.log('error', message, [...args, this._getLineInfo()]);
        }
    }

    trace(message: string, ...args: any[]): void {
        this.log('trace', message, args);
    }

    timer(name: string): void {
        if (this.timers[name]) {
            delete this.timers[name];
            console.timeEnd.call(console, name);
        } else {
            this.timers[name] = true;
            console.time.call(console, name);
        }
    }
};

export const log = new Logger('main');