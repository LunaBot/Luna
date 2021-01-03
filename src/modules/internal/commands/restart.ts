import { Channel, Interaction, Message, TextChannel } from 'discord.js';
import { spawn as spawnProcess } from 'child_process';
import { client } from '@/client';
import { Command } from '@/command';

export class Restart extends Command {
    public name = 'Restart';
    public command = 'restart';
    public timeout = 5000;
    public description = 'Restart AutoMod';
    public hidden = false;
    public options = [];
    public permissions = [];
    public examples = ['!restart'];
    public roles = [];

    async messageHandler(_prefix: string, message: Message) {
        return this.handler(message.channel);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler(interaction.channel);
    }

    /**
     * Restart handler
     */
    async handler(channel: Channel) {
        // Update discord activity
        await client.user?.setActivity(`restarting...`);

        // Return success
        (channel as TextChannel).send('Restarting...');

        // Spawn new bot
        spawnProcess(process.argv[1], process.argv.slice(2), {
            detached: true, 
            stdio: ['ignore', process.stdout, process.stderr]
        }).unref();

        // Kill this process
        process.exit();

        // Return success
        return '3... 2... 1...';
    }
};