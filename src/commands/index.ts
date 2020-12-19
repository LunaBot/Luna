import alias from './alias';
import announce from './announce';
import bot from './bot';
import botInvite from './bot-invite';
import clear from './clear';
import command from './command';
import commandHelp from './command-help';
import commands from './commands';
import help from './help';
import image from './image';
import level from './level';
import ping from './ping';
import setBotCommandsChannel from './set-bot-commands-channel';
import setPrefix from './set-prefix';
import setup from './setup';
import spank from './spank';
import spoiler from './spoiler';
import random from './random';
import type { Command } from '../command';

const _commands: Command[] = [
    alias,
    announce,
    bot,
    botInvite,
    clear,
    command,
    commandHelp,
    commands,
    help,
    image,
    level,
    ping,
    setBotCommandsChannel,
    setPrefix,
    setup,
    spank,
    spoiler,
    random
];

export default _commands;