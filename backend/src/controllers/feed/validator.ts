import Joi from "joi";

export const feedParamsValidator = Joi.object({
    userId: Joi.string().required()
})
