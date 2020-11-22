import bot from './bot';
import clear from './clear';
import command from './command';
import commandHelp from './command-help';
import commands from './commands';
import help from './help';
import ping from './ping';
import setBotCommandsChannel from './set-bot-commands-channel';
import setPrefix from './set-prefix';
import setup from './setup';
import type { Command } from '../types';

const _commands: Command[] = [
    bot,
    clear,
    command,
    commandHelp,
    commands,
    help,
    ping,
    setBotCommandsChannel,
    setPrefix,
    setup
];

export default _commands;