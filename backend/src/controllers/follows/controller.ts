import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import Follow from "../../models/follow";
import { col } from "sequelize";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";


export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await User.findAll()
        const usersMainData = users.map(user => ({
            id: user.get('id'),
            name: user.get('name'),
            profileImgUrl: user.get('profileImgUrl'),
        }))
        res.json(usersMainData)
    } catch (e) {
        next(e)
    }
}


export async function getFollowers(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId

        const user = await User.findByPk(userId, {
            include: [{
                model: User,
                as: 'followers',
                attributes: ['id', 'name', 'profileImgUrl'],
                through: { attributes: [] } // removes junction table fields
            }],
            order: [[col('followers.name'), 'ASC']],
        })
        res.json({ users: user.followers, usersNum: user.followers.length })
    } catch (e) {
        next(e)
    }
}

export async function getFollowing(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId

        const user = await User.findByPk(userId, {
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'name', 'profileImgUrl'],
                through: { attributes: [] }, // removes junction table fields
            }]
        })
        res.json({ users: user.following, usersNum: user.following.length })
    } catch (e) {
        next(e)
    }
}

export async function follow(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        const userId = req.userId
        const follow = await Follow.create({
            followerId: req.params.id,
            followeeId: userId
        })
        res.json(follow)
    } catch (e) {
        next(e)
    }
}

export async function unfollow(req: Request<{ id: string }>, res: Response, next: NextFunction) {

    try {
        const userId = req.userId
        const isUnfollowed = await Follow.destroy({
            where: {
                followerId: userId,
                followeeId: req.params.id
            }
        })
        if (!isUnfollowed) return next(new AppError(
            StatusCodes.NOT_FOUND,
            'tried to delete unexisting record'
        ))
        res.json({ success: true })
    } catch (e) {
        next(e)
    }
}