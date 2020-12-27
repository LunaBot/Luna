import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { Command } from '../command';
import axios from 'axios';

const match = (string: string) => {
  const groups = string.match(/\[(?<warning>.*)\] (?<message>.*)/i)?.groups;
  if (groups) {
    return { ...groups };
  }
};

const getImage = async (url: string) => {
  const imageBuffer = await axios.get(
    url,
    { responseType: 'arraybuffer' },
  );

  return Buffer.from(imageBuffer.data, 'base64');
}

class Spoiler extends Command {
  public name = 'spoiler';
  public command = 'spoiler';
  public timeout = 1000;
  public description = 'Create a spoiler image';
  public hidden = false;
  public owner = false;
  public examples = [ '!spoiler' ];
  public roles = [ '@everyone' ];

  // !spoiler [CW: This is a test post] Well this is neat!
  // !spoiler [TW: This is a test post] Well this is neat!
  // !spoiler Well this is neat!
  async handler(_prefix: string, message: Message, _args: string[]) {
    // Parse message
    const text = _args.join(' ').trim();
    const spoilerInfo = match(text);

    // Set main content
    const content = (spoilerInfo?.message || text).trim();

    // No chars
    if (content.length === 0 && message.attachments.size === 0) {
      return 'You need to provide a description or image.';
    }

    // Only allow 2000 chars
    if (content.length >= 2000) {
      return `Couldn't spoiler, too many characters. ${content.length}/2000`;
    }

    // Creat message
    const embed = new MessageEmbed({
      author: {
        name: message.author.username,
        iconURL: message.author.avatarURL({
          size: 32
        })?.toString()
      },
      description: `||${content}||\n\nPosted by <@!${message.author.id}>`
    });

    // Create images
    const images = await Promise.all(message.attachments.mapValues(async attachment => {
      const image = await getImage(attachment.url);
      // const extension = attachment.name?.split('.')[attachment.name?.split('.').length - 1];
      // const fileName = `spoiler_image.${extension}`;
      // console.log({fileName, extension});
      return new MessageAttachment(image, `SPOILER_${attachment.name}`, {
        id: Math.random(),
        spoiler: true
      });
      // return {
      //   ...attachment,
      //   attachment: attachment.attachment,
      //   name: `SPOILER_${attachment.name}`,
      //   spoiler: true
      // };
    }).array());

    // Remove original message
    await message.delete();

    // No content just images
    if (content.length === 0) {
      console.log('no content, just images');
      return [...images];
    }

    // Generic spoiler
    if (!spoilerInfo) {
      console.log('content');
      embed.setTitle(`Spoiler`);
      return [embed, ...images];
    }

    // Trigger/Content warning
    embed.setColor('#FF0000');
    embed.setTitle(spoilerInfo.warning);
    return [embed, ...images];
  }
};

export default new Spoiler();