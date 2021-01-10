import { Role } from "discord.js";

export interface AutoRole {
    id: string;
    serverId: string;
    roles: string[];
    timer: number;
}

export interface RoleSummary {
    role: Role;
    action: 'add' | 'remove';
    missing: boolean;
};
