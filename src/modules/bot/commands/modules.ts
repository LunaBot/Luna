import { Interaction, Message, MessageEmbed } from 'discord.js';
import { Command } from '@/command';
import { config } from '@/config';
import { isTextChannelMessage } from '@/guards';
import { moduleManager } from '@/module-manager';

export class Modules extends Command {
    public name = 'Modules';
    public command = 'modules';
    public timeout = 5000;
    public description = 'Control AutoMod modules.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public permissions = [];

    async messageHandler(_prefix: string, message: Message, _args: string[]) {
        if (isTextChannelMessage(message)) {
            return this.handler(message.guild.id);
        }
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler(interaction.guild.id);
    }

    // !modules
    async handler(serverId: string) {
        // Get all modules from db
        const modules = await moduleManager.getEnabledModules(serverId);

        // Create embeds
        const fields = modules.map(_module => {
            return {
                name: _module.name,
                value: _module.enabled ? ':white_check_mark: Enabled' : ':no_entry_sign: Disabled'
            };
        });

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL(config.PUBLIC_URL)
            .setAuthor('Modules')
            .addFields(fields);

        return embed;
    }
};