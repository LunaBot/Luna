import type { Message, Guild, Channel, GuildChannel, TextChannel, NewsChannel } from 'discord.js';

export type DmMessage = Message & {
    guild: null;
};

export type TextMessage = Message & {
    guild: Guild;
};

export const isDMChannelMessage = (message: Message): message is DmMessage => message.channel.type === 'dm';
export const isNewsChannelMessage = (message: Message): message is TextMessage => message.channel.type === 'news';
export const isTextChannelMessage = (message: Message): message is TextMessage => message.channel.type === 'text';

export const isTextChannel = (channel?: Channel | GuildChannel): channel is TextChannel => channel?.type === 'text';
export const isNewsChannel = (channel?: Channel | GuildChannel): channel is NewsChannel => channel?.type === 'news';