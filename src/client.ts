import { Client, Structures } from 'discord.js';

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
