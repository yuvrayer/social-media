import { NextFunction, Request, Response } from "express";
import User from "../../models/user";
import GamesBestScores from "../../models/gamesBestScore";
import { Op } from 'sequelize';

export async function getGamesBestScores(req: Request<{ gameCode: string }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const gameCode = req.params.gameCode

        // Get the current user and their followings
        const currentUser = await User.findByPk(userId, {
            include: [{
                model: User,
                as: 'following',
                attributes: ['id', 'name', 'profileImgUrl'],
                through: { attributes: [] }
            }]
        });

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const followedUsers = currentUser.following || [];

        //take only their user Id
        const followedUserIds = [...followedUsers.map(user => user.id), userId]

        // get best scores for followed users
        const scores = await GamesBestScores.findAll({
            where: {
                gameCode,
                userId: {
                    [Op.in]: followedUserIds
                }
            },
            include: [{
                model: User,
                attributes: ['name', 'profileImgUrl']
            }],

            attributes: ['userId', 'bestScore']
        });

        // Format response
        const formattedScores = scores.map(score => ({
            userId: score.userId,
            bestScore: score.bestScore,
            name: score.user?.dataValues?.name,
            profileImgUrl: score.user?.dataValues?.profileImgUrl
        }));

        res.status(200).json(formattedScores);
    } catch (e) {
        next(e);
    }
}

export async function newGameBestScore(req: Request<{ gameCode: string }, {}, { newBestScore: number }>, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        const { gameCode } = req.params
        const { newBestScore } = req.body

        // checks if the user already has top score
        const myOldScore = await GamesBestScores.findOne({
            where: {
                gameCode,
                userId
            },
            attributes: ['id', `bestScore`]
        });

        // create if doesn`t exist old score (first time)
        if (!myOldScore) {
            await GamesBestScores.create({
                gameCode,
                userId,
                bestScore: newBestScore
            })
        } else { //there is an old score
            await GamesBestScores.update(
                { bestScore: newBestScore },
                { where: { id: myOldScore.id } }
            )
        }

        res.status(200);
    } catch (e) {
        next(e);
    }
}