import Joi from "joi";

export const followRequestParamsValidator = Joi.object({
    userId: Joi.string().required()
})

export const deleteRequestParamsValidator = followRequestParamsValidator
