import humanizeDuration from 'humanize-duration';
import { envs } from '@/envs';
import { log } from '@/log';
import { Server } from '@/servers';
import type { Interaction } from 'discord.js';

let isStarting = true;

export const interactionCreate = async (interaction: Interaction) => {
    // @ts-expect-error
    interaction.startedProcessingTimestamp = new Date();
    try {
        // In development mode only allow the bot's own server to process
        if (envs.NODE_ENV === 'development' && interaction.guild?.id !== envs.OWNER.SERVER) {
            return;
        }

        // In production skip if bot is still starting up
        if (envs.NODE_ENV === 'production' && isStarting) {
            // Will be false after 30s of uptime
            isStarting = process.uptime() <= 30;

            // Is still under 30s bail
            if (isStarting) {
                log.silly(`Skipping message as bot has only been up for ${humanizeDuration(process.uptime() * 1000)}.`);
                return;
            }
        }

        // Get current server
        const server = await Server.findOrCreate({ id: interaction.guild.id });

        // Get current user
        const user = await server.getUser({ id: interaction.author?.id! });

        // Process interaction
        const result = await user.processInteraction(interaction);

        // Process result
        await user.processResult(result, interaction.channel, interaction.member!);
    } catch (error) {
        log.error(error);

        // Reply with error
        if (process.env.DEBUG) {
            // Show debugging to owner
            if (envs.OWNER.ID === interaction.member?.id) {
                await interaction.channel.send('```json\n' + JSON.stringify(error, null, 2) + '\n```');
                return;
            }
        }

        await interaction.channel.send(error.message);
    }
};
