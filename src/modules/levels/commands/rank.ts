import { Command } from '@/command';
import canvacord from 'canvacord';
import { User } from '@/user';
import { Channel, Interaction, Message, MessageAttachment, TextChannel } from 'discord.js';
import { client } from '@/client';
import { LevelManager } from '@/levels';
import { database } from '@/database';
import { sql } from '@databases/pg';

export class Rank extends Command {
  public name = 'Rank';
  public command = 'rank';
  public timeout = Command.TIMEOUTS.FIVE_SECONDS;
  public description = 'Get your current rank card';
  public hidden = false;
  public owner = false;
  public examples = ['!rank'];
  public roles = [];

  async messageHandler(_prefix: string, message: Message, _args: string[]) {
    return this.handler({ userId: message.author.id }, message.guild!.id, message.channel);
  }

  async interactionHandler(_prefix: string, interaction: Interaction) {
    return this.handler({ userId: interaction.author!.id }, interaction.guild.id, interaction.channel);
  }

  async handler({ userId }: { userId: string }, serverId: string, channel: Channel) {
    const user = await User.findOrCreate({ id: userId, serverId });
    const member = client.guilds.cache.get(serverId)?.members.cache.get(userId);
    const nextLevelXp = LevelManager.LevelToExperience(user.level + 1);
    const rankQuery = sql`SELECT rank FROM (SELECT *, ROW_NUMBER() OVER(ORDER BY experience) as rank from users) result WHERE serverId=${serverId}`;
    const rank = await database.query(rankQuery).then(result => {
      return result[0].rank;
    });
    
    const rankCard = new canvacord.Rank()
      .setAvatar(user.displayImage)
      .setCurrentXP(user.experience)
      .setLevel(user.level)
      .setRequiredXP(nextLevelXp)
      .setRank(rank)
      .setStatus('dnd')
      .setFontSize('26px')
      .setProgressBar("#FFFFFF", "COLOR")
      .setUsername(member?.user.username, member?.displayHexColor)
      .setDiscriminator(member?.user.discriminator);
    
    const data = await rankCard.build();
    const attachment = new MessageAttachment(data, 'rank-card.png');
    await (channel as TextChannel).send(attachment);

    return Symbol.for('silent');
  }
};
