import Joi from "joi";

export const followRequestParamsValidator = Joi.object({
    userId: Joi.string().required()
})

export const sendFollowRequestValidator = Joi.object({
    name: Joi.string().required(),
    profileImgUrl: Joi.string().required().allow(null)
})

export const deleteRequestParamsValidator = followRequestParamsValidator
