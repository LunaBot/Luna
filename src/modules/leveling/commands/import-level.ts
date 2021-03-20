import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { Pool } from 'pg';
import { CommandError } from '../../../errors';
import { experienceToLevel } from '../../../utils';

const db = new Pool({
    ssl: {
        rejectUnauthorized: false,
    }
});

class ImportLevel extends Command {
    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        try {

            // Import XP from old DB
            const response = await db.query('SELECT * FROM users WHERE serverId=$1::text AND id=$2::text', [message.guild.id, message.author.id]);

            // No user found
            if (response.rows.length === 0) throw new CommandError('No user found in old DB, import failed!');

            // Get old XP
            const experience = parseInt(response.rows[0].experience);

            // Update new DB
            client.points.set(`${message.guild.id}-${message.author.id}`, experience, 'experience');
            client.points.set(`${message.guild.id}-${message.author.id}`, experienceToLevel(experience), 'level');

            // Reply to user
            await message.channel.send('Imported XP!');
        } catch (error: unknown) {
            client.logger.debug('Failed importing XP for %s with "%s', message.author.id, (error as Error).message);
        }
    }
}

export const importLevel = new ImportLevel();
