import Joi from "joi";

export const commentValidator = Joi.object({
    commentId: Joi.string().required()
})

export const postValidator = Joi.object({
    postId: Joi.string().required()
})
