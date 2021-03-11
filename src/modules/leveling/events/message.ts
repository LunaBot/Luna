import type { Client, Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import ml from 'ml-sentiment';
import { experienceToLevel } from '../../../utils';

/**
 * Cap value between min and max.
 */
const capValue = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

/**
 * Get experience based on message sentiment.
 */
const getExperience = (client: Client, message: Message) => {
    const sentiment = ml().classify(message.content);
    const baseXp = 20;
    const sentimentPercentage = sentiment / 100;
    const experience = capValue(1 + (baseXp * sentimentPercentage), -20, 20);
    return experience;
};

const annoucements = {
    async dm(client: Client, message: Message, annoucement: string) {
        await message.author.dmChannel?.send(annoucement);
    },
    async reply(client: Client, message: Message, annoucement: string) {
        await message.reply(annoucement);
    },
    async channel(client: Client, message: Message, annoucement: string) {
        const guildConfig = client.settings.get(message.guild!.id)!;
        const channel = message.guild?.channels.cache.get(guildConfig.leveling.announcement.channel)!;
        await (channel as TextChannel).send(annoucement);
    }
};

export const message = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    if (!message.guild || message.author.bot || !message.member) {
        return;
    }

    // Create named logger with id and name
    const logger = client.logger.createChild({
        prefix: message.guild.id
    }).createChild({
        prefix: message.guild.name
    });

    // Bail if it's a command
    const guildConfig = client.settings.get(message.guild.id)!;
    if (message.content.indexOf(guildConfig.prefix) === 0) {
        logger.silly('%s gained 0 exp for "%s" as it looks like a command.', message.author.tag, message.content);
        return;
    }

    // We'll use the key often enough that simplifying it is worth the trouble.
    const pointsKey = `${message.guild.id}-${message.author.id}`;

    // Triggers on new users we haven't seen before.
    client.points.ensure(pointsKey, {
        user: message.author.id,
        guild: message.guild.id,
        experience: 0,
        level: 1
    });

    // Give experience to user 
    const experience = getExperience(client, message);
    client.points.math(pointsKey, '+', experience, 'experience');
    logger.silly('%s gained %s exp for "%s"', message.author.tag, experience, message.content);

    // Calculate the user's current level
    const curLevel = experienceToLevel(client.points.get(pointsKey, 'experience'));

    // Act upon level up by sending a message and updating the user's level in the db.
    if (client.points.get(pointsKey, 'level') < curLevel) {
        // Update points
        client.points.set(pointsKey, curLevel, 'level');

        // Bail if it's disabled
        if (!guildConfig.leveling.announcement.enabled) return;

        // Announce level up!
        if (Object.keys(annoucements).includes(guildConfig.leveling.announcement.channel)) {
            annoucements[guildConfig.leveling.announcement.channel](`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
        }
    }
};
