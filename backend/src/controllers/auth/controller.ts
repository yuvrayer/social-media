import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import { createHmac } from "crypto";
import config from 'config'
import { sign } from "jsonwebtoken";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";


export function hashPassword(password: string): string {
    return createHmac('sha256', config.get<string>('app.secret'))
        .update(password)
        .digest('hex')
}

export async function login(req: Request<{}, {}, { username: string, password: string }>, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body
        const user = await User.findOne({
            where: {
                username,
                password: hashPassword(password)
            },
        })

        if (!user) return next(new AppError(StatusCodes.UNAUTHORIZED, 'wrong credentials'))


        const jwt = sign(user.get({ plain: true }), config.get<string>('app.jwtSecret'))
        res.json({ jwt })
    } catch (e) {
        next(e)
    }
}

export async function signup(req: Request<{}, {}, { username: string, password: string, name: string }>, res: Response, next: NextFunction) {
    try {
        const { username, password, name } = req.body
        let profileImgUrl = null

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            res.status(StatusCodes.CONFLICT).json({
                field: 'username',
                message: 'Username already taken'
            })
            return next(new AppError(StatusCodes.CONFLICT, `Username already taken`));
        }

        const existingName = await User.findOne({ where: { name } });
        if (existingName) {
            res.status(StatusCodes.CONFLICT).json({
                field: 'username',
                message: 'Name is in use already'
            })
            return next(new AppError(StatusCodes.CONFLICT, 'Name is in use already'));
        }

        if (req.imageUrl) {
            profileImgUrl = req.imageUrl
        }

        const user = await User.create({
            username,
            name,
            profileImgUrl,
            password: hashPassword(password)
        })

        const jwt = sign(user.get({ plain: true }), config.get<string>('app.jwtSecret'))
        res.json({ jwt })

    } catch (e) {
        next(e)
    }
}

export async function changeDetail(req: Request<{}, {}, { name: string, id: string, alreadyPic: string }>, res: Response, next: NextFunction) {

    try {
        const { name } = req.body
        let profileImgUrl = req.body.alreadyPic

        const existingUser = await User.findOne({ where: { name } });
        if (existingUser.id !== req.body.id) return next(new AppError(StatusCodes.CONFLICT, 'Name is in use already'))


        if (req.imageUrl && !req.body.alreadyPic) {
            profileImgUrl = req.imageUrl
        }

        const [affectedRows] = await User.update(
            { name, profileImgUrl },
            { where: { id: req.body.id } }
        )

        if (affectedRows === 0) {
            return next(new AppError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const updatedUser = await User.findOne({ where: { id: req.body.id } });

        const jwt = sign(updatedUser.get({ plain: true }), config.get<string>('app.jwtSecret'))
        res.json({ jwt })

    } catch (e) {
        next(e)
    }
}