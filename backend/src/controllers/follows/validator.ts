import Joi from "joi";

export const followParamsValidator = Joi.object({
    id: Joi.string().uuid().required()
})

export const followValidator = Joi.object({
    name: Joi.string().required(),
    profileImgUrl: Joi.string().required().allow(null),
    id: Joi.string().uuid().required()
})

export const unfollowParamsValidator = followParamsValidator