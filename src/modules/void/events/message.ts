import { database } from '@/database';
import { log } from '@/log';
import { sleep } from '@/utils';
import { sql } from '@databases/pg';
import { Message } from 'discord.js';

interface Void {
    id: string;
    timeout: number;
    type: VoidType;
    keepphrase: string;
};
type VoidType = keyof typeof voidHandlers;

// 1. Did we trigger a keep phrase?
// 2. Did another void delete this message?
// 3. Do we need to wait?
// 4. Who are we allowed to remove?
// 5. Remove the message
const deleteMessage = async (message: Message, _void: Void) => {
    // If we have a keep phrase and just triggered it then bail
    if (_void.keepphrase && (message.content.startsWith(_void.keepphrase) || message.content.endsWith(_void.keepphrase))) {
        return;
    }

    // If another void hasn't removed it then let's do it ourselves
    if (!message.deleted) {
        // Should we wait before deleting the message?
        if (_void.timeout) {
            await sleep(_void.timeout);
        }

        // Check if another void managed to delete this while we were waiting
        if (!message.deleted) {
            // Delete the message
            await message.delete().catch(error => {
                // @todo: clean this up
                //        1. maybe move this to it's own logger?
                //        2. maybe move all modules to their own loggers?
                log.error('Void:error', error);
            });
        }
    }
}
const voidHandlers = {
    async admin(message: Message, _void: Void) {
        const query = sql`SELECT adminRoles FROM servers WHERE id=${message.guild!.id}`;
        const roles = await database.query<{ adminroles: string[] }>(query).then(rows => [...rows[0].adminroles]);
        // If they're an admin delete their message
        if (message.member?.roles.cache.some(role => roles.includes(role.id))) {
            return deleteMessage(message, _void);
        }
    },
    async moderator(message: Message, _void: Void) {
        const query = sql`SELECT modRoles FROM servers WHERE id=${message.guild!.id}`;
        const roles = await database.query<{ modroles: string[] }>(query).then(rows => [...rows[0].modroles]);
        // If they're a moderator delete their message
        if (message.member?.roles.cache.some(role => roles.includes(role.id))) {
            return deleteMessage(message, _void);
        }
    },
    async staff(message: Message, _void: Void) {
        const query = sql`SELECT adminRoles, modRoles FROM servers WHERE id=${message.guild!.id}`;
        const roles = await database.query<{ adminroles: string[], modroles: string[] }>(query).then(rows => [...rows[0].adminroles, ...rows[0].modroles]);
        // If they're an admin or moderator delete their message
        if (message.member?.roles.cache.some(role => roles.includes(role.id))) {
            return deleteMessage(message, _void);
        }
    },
    async member(message: Message, _void: Void) {
        const query = sql`SELECT adminRoles, modRoles FROM servers WHERE id=${message.guild!.id}`;
        const roles = await database.query<{ adminroles: string[], modroles: string[] }>(query).then(rows => [...rows[0].adminroles, ...rows[0].modroles]);
        console.log(roles);
        // If they're NOT an admin or moderator delete their message
        if (!message.member?.roles.cache.some(role => roles.includes(role.id))) {
            return deleteMessage(message, _void);
        }
    },
    async '*'(message: Message, _void: Void) {
        return deleteMessage(message, _void);
    },
};

export const message = async (message: Message) => {
    // Skip bot messages
    if (message.author.bot) return;

    // Get voids
    const query = sql`SELECT id, timeout, type, keepPhrase FROM voids WHERE ${message.channel.id}=ANY(channelIds) AND enabled=${true}`;
    const voids = await database.query<Void>(query);

    // Bail if there are no voids enabled for this channel
    if (voids.length === 0) return;

    // We have voids for this channel
    await Promise.all(voids.map(async _void => {
        // If we're trying to use a non-existant void type then disable the void for now
        // Idk how this happened but it's good we caught it. ^_^
        if (!Object.keys(voidHandlers).includes(_void.type)) await database.query(sql`UPDATE voids SET enabled=${false} WHERE id=${_void.id}`);

        // admin: delete adminRoles in timeout seconds
        // moderator: delete moderatorRoles in timeout seconds
        // staff: delete adminRoles AND moderatorRoles in timeout seconds
        // member: delete non adminRoles AND moderatorRoles in timeout seconds
        // *: delete ALL messages in timeout seconds
        log.debug('Running a %s void against "%s"', _void.type, message.content);
        await voidHandlers[_void.type](message, _void);
    }));
};
