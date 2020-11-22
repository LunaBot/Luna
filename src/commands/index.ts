import bot from './bot';
import botInvite from './bot-invite';
import clear from './clear';
import command from './command';
import commandHelp from './command-help';
import commands from './commands';
import help from './help';
import ping from './ping';
import setBotCommandsChannel from './set-bot-commands-channel';
import setPrefix from './set-prefix';
import setup from './setup';
import random from './random';
import type { Command } from '../command';

const _commands: Command[] = [
    bot,
    botInvite,
    clear,
    command,
    commandHelp,
    commands,
    help,
    ping,
    setBotCommandsChannel,
    setPrefix,
    setup,
    random
];

export default _commands;