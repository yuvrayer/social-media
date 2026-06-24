import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import { createHmac } from "crypto";
import config from 'config'
import { sign } from "jsonwebtoken";
import AppError from "../../errors/app-error";
import { StatusCodes } from "http-status-codes";


//function for create password by hash
export function hashPassword(password: string): string {
    return createHmac('sha256', config.get<string>('app.secret'))
        .update(password)
        .digest('hex')
}

//login function
export async function login(req: Request<{}, {}, { username: string, password: string }>, res: Response, next: NextFunction) {
    try {
        const { username, password } = req.body
        const user = await User.findOne({
            where: {
                username,
                password: hashPassword(password)
            },
        })

        //if there isn`t such a user
        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                message: 'wrong credentials'
            })
            return next(new AppError(StatusCodes.UNAUTHORIZED, 'wrong credentials'))
        }

        const jwt = sign(user.get({ plain: true }), config.get<string>('app.jwtSecret'))
        res.json({ jwt })
    } catch (e) {
        next(e)
    }
}

//signup function
export async function signup(req: Request<{}, {}, { username: string, password: string, name: string }>, res: Response, next: NextFunction) {
    try {
        const { username, password, name } = req.body
        let profileImgUrl = null

        const existingUsername = await User.findOne({ where: { username } });

        //checks if the username is not unique
        if (existingUsername) {
            res.status(StatusCodes.CONFLICT).json({
                field: 'username',
                message: 'Username already taken'
            })
            return next(new AppError(StatusCodes.CONFLICT, `Username already taken`));
        }

        //checks if the name is not unique
        const existingName = await User.findOne({ where: { name } });
        if (existingName) {
            res.status(StatusCodes.CONFLICT).json({
                field: 'username',
                message: 'Name already taken'
            })
            return next(new AppError(StatusCodes.CONFLICT, 'Name already taken'));
        }

        //takes the user image (if he uploaded)
        if (req.imageUrl) {
            profileImgUrl = req.imageUrl
        }

        //create the user in the database
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
        //save his after-change details
        const { name } = req.body
        let profileImgUrl = req.body.alreadyPic

        //checks if the name is not unique
        const existingUser = await User.findOne({ where: { name } });
        if (existingUser && existingUser.id !== req.body.id) return next(new AppError(StatusCodes.CONFLICT, 'Name already taken'))

        //if he didn`t changed his profile image- keep it
        if (req.imageUrl && !req.body.alreadyPic) {
            profileImgUrl = req.imageUrl
        }

        //update the database
        const [affectedRows] = await User.update(
            { name, profileImgUrl },
            { where: { id: req.body.id } }
        )

        if (affectedRows === 0) {
            return next(new AppError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const updatedUser = await User.findOne({ where: { id: req.body.id } });
        if (!updatedUser) {
            return next(new AppError(StatusCodes.NOT_FOUND, "User not found"));
        }

        const jwt = sign(
            updatedUser.get({ plain: true }),
            config.get<string>('app.jwtSecret')
        );
        res.json({ jwt })

    } catch (e) {
        next(e)
    }
}