import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";
import PendingFollowRequest from "../../models/followRequest";
import io from "../../io/io";


export async function getAllPendingRequestsIReceived(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        // Get all requests where the logged-in user is the receiver
        const pendingRequests = await PendingFollowRequest.findAll({
            where: { receiverId: userId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'name', 'username'], // Limit returned fields
                }
            ],
            order: [[{ model: User, as: 'sender' }, 'name', 'ASC']],
        });

        // Extract users from the included sender associations
        const receivedIds = pendingRequests.map(request => request.dataValues.sender.dataValues);

        res.json({ users: receivedIds, usersNum: receivedIds.length });
    } catch (e) {
        next(e);
    }
}


export async function getAllPendingRequestsISent(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        // Get all requests where the logged-in user is the receiver
        const pendingRequests = await PendingFollowRequest.findAll({
            where: { senderId: userId },
            include: [
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'name', 'username'], // Limit returned fields
                }
            ],
            order: [[{ model: User, as: 'receiver' }, 'name', 'ASC']],
        });

        // Extract users from the included sender associations
        const sentIds = pendingRequests.map(request => request.dataValues.receiver.dataValues);

        res.json({ users: sentIds, usersNum: sentIds.length });
    } catch (e) {
        next(e);
    }
}


export async function sendFollowRequest(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const follow = await PendingFollowRequest.create({
            senderId: userId,
            receiverId: req.params.userId
        })
        res.json(follow)

        /////////////
        io.to(req.params.userId).emit('friendRequest:new', {
            to: req.params.userId,
            from: userId,
            message: 'You have a new friend request!',
        })

    } catch (e) {
        next(e)
    }
}

export async function deleteFollowRequest(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const isUnfollowed = await PendingFollowRequest.destroy({
            where: {
                senderId: req.params.userId,
                receiverId: userId
            }
        })
        if (isUnfollowed === 0) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete unexisting record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}



export async function cancelFollowRequest(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const isUnfollowed = await PendingFollowRequest.destroy({
            where: {
                senderId: userId,
                receiverId: req.params.userId
            }
        })
        if (isUnfollowed === 0) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete unexisting record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}

