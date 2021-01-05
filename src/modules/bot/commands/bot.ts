import git from 'git-rev-sync';
import humanizeDuration from 'humanize-duration';
import { ApplicationCommandOptionType, Command } from '@/command';
import { envs } from '@/envs';
import { Interaction, Message, MessageEmbed } from 'discord.js';
import { client } from '@/client';
import { AppError } from '@/errors';
import dedent from 'dedent';
import { Server } from '@/servers';

export class Bot extends Command {
    public name = 'Bot';
    public command = 'bot';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
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
    }, {
        name: 'prefix',
        description: 'Set the bot prefix',
        type: ApplicationCommandOptionType.SUB_COMMAND,
        options: [{
            name: 'prefix',
            description: 'The bot\'s new prefix, default is `!`',
            type: ApplicationCommandOptionType.STRING
        }]
    }]

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        return this.handler({
            command: args[0],
            prefix: args[1],
        }, message.createdTimestamp, message.id, message.guild!.id);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler({
            command: interaction.options ? interaction.options[0].name : 'info',
            prefix: interaction.options ? interaction.options[1].name : '!',
        }, interaction.createdTimestamp, interaction.id, interaction.guild.id);
    }

    async handler(options: { command?: string, prefix: string }, createdTimestamp: number, messageId: string, serverId: string) {
        const commands = {
            invite: () => this.inviteHandler(),
            info: () => this.infoHandler(createdTimestamp, messageId),
            prefix: () => this.prefixHandler({ prefix: options.prefix }, serverId),
        };

        // Return bot info
        if (!options.command) {
            return commands.info();
        }

        // Invalid command
        if (!Object.keys(commands).includes(options.command as keyof typeof commands)) {
            // @todo: Make a new error for this
            throw new AppError('Invalid subcommand');
        }

        return commands[options.command as keyof typeof commands]();
    }

    async inviteHandler() {
        const clientId = client.user?.id;
        if (!clientId) {
            throw new AppError('No client ID found');
        }

        return new MessageEmbed({
            description: dedent`
                You can invite me [here](https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=0)!
                Make sure to assign me a role once I'm added. :hearts:
            `,
            color: 11800515
        });
    }

    async infoHandler(createdTimestamp: number, messageId: string) {
        const uptime = humanizeDuration(Math.floor(process.uptime()) * 1000);
        const latency = Math.round(client.ws.ping);
        const timeTaken = (Date.now() - createdTimestamp) - latency;
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
                        name: 'Latency',
                        value: `${latency}ms`,
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: `${envs.BOT.COMMIT_HASH.substring(0, 7) || git.short()}`,
                        inline: true
                    },
                    {
                        name: 'Creator',
                        value: `<@${envs.OWNER.ID}>`,
                        inline: false
                    },
                    {
                        name: 'Support us',
                        value: 'You can support us by staring our repo on [Github](https://github.com/automodbot/automod).',
                        inline: false
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

    async prefixHandler(options: { prefix: string }, serverId: string) {
        // We need no more than 1 character
        if (typeof options.prefix === 'string' && options.prefix.length >= 2) {
            throw new AppError('Prefix can only be a single character!');
        }

        // Print current prefix
        const server = await Server.findOrCreate({ id: serverId });
        if (!options.prefix) {
            return `Prefix is currently set to \`${server.prefix}\``;
        }

        // Update prefix
        try {
            await server.setPrefix(options.prefix);
            return `Set prefix to \`${options.prefix}\``;
        } catch (error) {
            return `Failed updating prefix to \`${options.prefix}\``;
        }
    }
};