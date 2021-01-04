import git from 'git-rev-sync';
import humanizeDuration from 'humanize-duration';
import { ApplicationCommandOptionType, Command } from '@/command';
import { envs } from '@/envs';
import { Interaction, Message, MessageEmbed } from 'discord.js';
import { client } from '@/client';
import { AppError } from '@/errors';

export class Bot extends Command {
    public name = 'Bot';
    public command = 'bot';
    public timeout = 5000;
    public description = 'Bot specific commands.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public options = [{
        name: 'invite',
        description: 'Get the bot\'s invite link',
        type: ApplicationCommandOptionType.SUB_COMMAND
    }, {
        name: 'info',
        description: 'Bot information',
        type: ApplicationCommandOptionType.SUB_COMMAND
    }]

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        return this.handler({
            command: args[0],
        }, message.createdTimestamp, message.member!.id, message.id);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler({
            command: interaction.options ? interaction.options[0].name : 'info',
        }, interaction.createdTimestamp, interaction.member!.id, interaction.id);
    }

    async handler({ command }: { command?: string }, createdTimestamp: number, memberId: string, messageId: string) {
        if (command === 'invite') {
            return this.inviteHandler();
        }

        return this.infoHandler(createdTimestamp, memberId, messageId);
    }

    async inviteHandler() {
        const clientId = client.user?.id;
        if (!clientId) {
            throw new AppError('No client ID found');
        }

        return new MessageEmbed({
            description: 'You can invite me [here](https://discordapp.com/oauth2/authorize?client_id=777463553253834785&scope=bot&permissions=0)!',
            color: 11800515
        });
    }

    async infoHandler(createdTimestamp: number, memberId: string, messageId: string) {
        const uptime = humanizeDuration(Math.floor(process.uptime()) * 1000);
        const timeTaken = (Date.now() - (createdTimestamp - client.ws.ping));
        // Account for negative pings
        // This happens since discord is slightly behind our system clock
        const ping = timeTaken >= 1 ? timeTaken : 1;
        const embeds = [
            {
                description: 'This is an open source Discord bot with a lot of features.\nUse `!commands` to see the command you have access to.',
                color: 651681,
                fields: [
                    {
                        name: 'Uptime',
                        value: uptime,
                        inline: true
                    },
                    {
                        name: 'Ping',
                        value: `${ping}ms`,
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: `${envs.BOT.COMMIT_HASH.substring(0, 7) || git.short()}`,
                        inline: true
                    },
                    {
                        name: 'Creator',
                        value: `<@${envs.OWNER.ID}>`
                    },
                    {
                        name: 'Support us',
                        value: 'You can support us by staring our repo on [Github](https://github.com/automodbot/automod).',
                        inline: true
                    }
                ],
                author: {
                    name: 'Automod - Bot Info',
                    icon_url: 'https://cdn.discordapp.com/attachments/794133875311771659/795540788226424842/auto_mod_logo_1.png'
                },
                footer: {
                    text: `Message ID: ${messageId}`
                },
                timestamp: new Date(),
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/794133875311771659/795540788226424842/auto_mod_logo_1.png'
                }
            }
        ]
        return embeds.map(embed => new MessageEmbed(embed));
    }
};