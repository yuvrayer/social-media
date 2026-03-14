import Joi from "joi";

export const getGamesBestScoresParamsValidator = Joi.object({
    gameCode: Joi.string().required()
})

export const newGameBestScoreParamsValidator = getGamesBestScoresParamsValidator

export const newGameBestScoreBodyValidator = Joi.object({
    newBestScore: Joi.number().required()
})

