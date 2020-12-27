import type { Message, Guild } from 'discord.js';

export type DmMessage = Message & {
    guild: null;
};

export type ServerMessage = Message & {
    guild: Guild;
};

export const isDMChannel = (message: Message): message is DmMessage => message.channel.type === 'dm';
export const isNewsChannel = (message: Message): message is ServerMessage => message.channel.type === 'news';
export const isTextChannel = (message: Message): message is ServerMessage => message.channel.type === 'text';
