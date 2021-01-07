import { Role } from 'discord.js';
import type { RoleAndAction } from './types';

export const isRoleAndAction = (object: any): object is RoleAndAction => object.role instanceof Role;