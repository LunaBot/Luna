import Statcord from 'statcord.js';
import { Client, Structures } from 'discord.js';
import { envs } from './envs';

Structures.extend('GuildMember', GuildMember => {
  class CoolGuild extends GuildMember {
    pending = false;

    constructor(client: any, data: any, guild: any) {
      super(client, data, guild);
      this.pending = data.pending ?? false;
    }

    _patch(data: any) {
      // @ts-expect-error
      super._patch(data);
      this.pending = data.pending ?? false;
    }
  }

  return CoolGuild;
});

export const client = new Client();

// Create statcord client
export const statcord = new Statcord.Client({
  client,
  key: envs.STATCORD.API_KEY,
  postCpuStatistics: true, /* Whether to post memory statistics or not, defaults to true */
  postMemStatistics: true, /* Whether to post memory statistics or not, defaults to true */
  postNetworkStatistics: true, /* Whether to post memory statistics or not, defaults to true */
});