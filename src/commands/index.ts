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
import leaderboards from './leaderboards';
import level from './level';
import mute from './mute';
import ping from './ping';
import profile from './profile';
import random from './random';
import setBotCommandsChannel from './set-bot-commands-channel';
import setPrefix from './set-prefix';
import setup from './setup';
import spank from './spank';
import spoiler from './spoiler';
import uptime from './uptime';
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
    leaderboards,
    level,
    mute,
    ping,
    profile,
    random,
    setBotCommandsChannel,
    setPrefix,
    setup,
    spank,
    spoiler,
    uptime,
];

export default _commands;