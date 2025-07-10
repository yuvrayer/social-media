import Joi from "joi";

export const storyValidator = Joi.object({
    userId: Joi.string().uuid().required(),
    profileImgUrl: Joi.string().required(),
    newStory: Joi.boolean().optional(),
    name: Joi.string().required()
})

export const newStoryFilesValidator = Joi.object({
    storyImage: Joi.object({
        mimetype: Joi.string().valid('image/png', 'image/jpg', 'image/jpeg')
    }).unknown(true).optional()
})