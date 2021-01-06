import { String, Record, Static, Partial, Literal, Boolean, Union } from 'runtypes';
import { Server } from '@/servers';
import { database } from './database';
import { sql } from '@databases/pg';
import { v4 as uuid } from 'uuid';
import { User } from './user';

const InfractionType = Union(
    Literal('warn'),
    Literal('ban'),
    Literal('kick'),
);

const InfractionOptions = Record({
    userId: String,
    moderatorId: String,
    type: InfractionType,
    reason: String,
}).And(Partial({
    id: String,
    silent: Boolean,
}));

export class AuditLog {
    public serverId: Server['id'];

    constructor(serverId: Server['id']) {
        this.serverId = serverId;
    }

    async addInfraction(infraction: Infraction) {
        const serverId = this.serverId;
        const id = infraction.id ?? uuid();
        const type = infraction.type;
        const silent = infraction.silent;
        const moderatorId = infraction.moderatorId;
        const userId = infraction.userId;
        const query = sql`INSERT INTO auditLog(id,serverId,type,silent,moderatorId,userId) VALUES (${id},${serverId},${type},${silent},${moderatorId},${userId})`;
        await database.query(query);
    }
};

export class Infraction {
    public userId: User['id'];
    public moderatorId: string;
    public type: Static<typeof InfractionType>;
    public reason: string;
    public silent: boolean;
    public id: string;

    constructor(options: Static<typeof InfractionOptions>) {
        // Ensure options are correct
        InfractionOptions.check(options);

        // Add options into class
        this.userId = options.userId;
        this.moderatorId = options.moderatorId;
        this.type = options.type;
        this.reason = options.reason ?? 'No reason given.';
        this.silent = options.silent ?? false;
        this.id = options.id ?? uuid();
    }
};