import { AppError } from '@/errors';
import { Request, Response, NextFunction } from 'express';

export const isInGuilds = function (request: Request, _response: Response, next: NextFunction) {
    // Only check serverId
    if (!request.params.serverId) return next();

    // Get user
    const user = request.user;

    // Check they're in the server we're trying to access
    if (!user || !user.guilds?.find(guild => guild.id === request.params.serverId)) {
        const error = new AppError('Access denied!');
        error.code = 403;
        throw error;
    }

    // Success
    return next();
};

export const isOwnerOfGuild = function (request: Request, _response: Response, next: NextFunction) {
    // Get server ID
    const serverId = request.params.serverId;

    // Only check serverId
    if (!serverId) return next();

    // Get user
    const user = request.user;

    // Check they're the owner of the server
    if (!user || !user.guilds?.find(guild => guild.id === serverId)?.owner) {
        const error = new AppError('Access denied!');
        error.code = 403;
        throw error;
    }

    // Success
    return next();
};