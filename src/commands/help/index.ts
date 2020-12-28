import { Message } from 'discord.js';
import { Command } from '../../command';
import { InvalidCommandError } from '../../errors';
import { menu as generateHelp } from './generators';
import { member as generateMemberRoleHelp, moderator as generateModeratorRoleHelp } from './generators/roles';

class Help extends Command {
    public name = 'help';
    public command = 'help';
    public timeout = 5000;
    public description = 'Show help';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async handler(prefix: string, _message: Message, args: string[]) {
        const role = args[0];
        if (!role) {
            return generateHelp(prefix);
        }

        if (role === 'moderator') {
            return generateModeratorRoleHelp(prefix);
        }

        if (role === 'member') {
            return generateMemberRoleHelp(prefix);
        }

        throw new InvalidCommandError(prefix, 'help', args);
    }
};

export default new Help();
