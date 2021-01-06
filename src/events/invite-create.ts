import { database } from "@/database";
import { sql } from "@databases/pg";
import { Invite } from "discord.js";
import { v4 as uuid } from 'uuid';

// Someone created an invite
export const inviteCreate = async (invite: Invite) => {
    const query = sql`
        INSERT INTO invites (id, serverId, code, inviter, expiry, channelId, createdTimestamp)
        VALUES(${uuid()}, ${invite.guild!.id}, ${invite.code}, ${invite.inviter!.id}, ${invite.maxAge}, ${invite.channel.id}, ${invite.createdTimestamp})
        ON CONFLICT DO NOTHING;
    `;

    // Save the invite in the DB
    await database.query(query);
};
