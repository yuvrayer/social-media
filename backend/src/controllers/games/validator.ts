import Joi from "joi";

export const getGamesBestScoresParamsValidator = Joi.object({
    gameCode: Joi.string().trim().min(1).max(50).required()
})

export const newGameBestScoreParamsValidator = getGamesBestScoresParamsValidator

export const newGameBestScoreBodyValidator = Joi.object({
    newBestScore: Joi.number().integer().min(0).required()
}).unknown(false)
    .options({ convert: false });

