import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import Follow from "../../models/follow";
import { col } from "sequelize";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";
import socket from "../../io/io";


export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        //get all the users from the database
        const users = await User.findAll()

        //map them, take just the id, name, profileImgUrl from each
        const usersMainData = users.map(user => ({
            id: user.get('id'),
            name: user.get('name'),
            profileImgUrl: user.get('profileImgUrl'),
        }))

        //send it to the user
        res.json(usersMainData)
    } catch (e) {
        next(e)
    }
}


export async function getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId

        //find the specific user by it`s Id, get his followers, but just their id, name, profileImgUrl
        const user = await User.findByPk(userId, {
            include: [{
                model: User,
                as: 'followers',
                attributes: ['id', 'name', 'profileImgUrl'],
                through: { attributes: [] } // removes junction table fields
            }],
            order: [[col('followers.name'), 'ASC']],
        })

        //send them to the user
        res.json({ users: user?.followers, usersNum: user?.followers.length })
    } catch (e) {
        next(e)
    }
}

export async function getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId

        //find the user in the database
        const user = await User.findByPk(userId, {
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'name', 'profileImgUrl'],
                through: { attributes: [] }, // removes junction table fields
            }]
        })

        //send the followings of the user
        res.json({ users: user?.following, usersNum: user?.following.length })
    } catch (e) {
        next(e)
    }
}

export async function follow(req: Request<{ id: string }, {}, {
    name: string, profileImgUrl: string | null, id: string
}>, res: Response, next: NextFunction) {

    try {
        const userId = req.userId

        //create them as follower, followee in the database
        const follow = await Follow.create({
            followerId: req.params.id,
            followeeId: userId
        })

        //send through socket to the user- your follow request has been approved
        socket.emit('friendRequest:approved', {
            to: req.params.id,
            userFillData: {
                name: req.body.name,
                profileImgUrl: req.body.profileImgUrl,
                id: req.body.id
            }
        })

        res.json(follow)
    } catch (e) {
        next(e)
    }
}

export async function unfollow(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        const userId = req.userId

        //delete the follow line from the database
        const isUnfollowed = await Follow.destroy({
            where: {
                followerId: userId,
                followeeId: req.params.id
            }
        })
        if (!isUnfollowed) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete missing record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}

export async function removeFromMyFollowers(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        const userId = req.userId

        //remove the follow line from the database (stop allow someone from following me)
        const isUnfollowed = await Follow.destroy({
            where: {
                followerId: req.params.id,
                followeeId: userId
            }
        })
        if (!isUnfollowed) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete missing record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}