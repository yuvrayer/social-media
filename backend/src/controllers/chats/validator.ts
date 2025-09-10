import Joi from "joi";

export const chatParamsValidator = Joi.object({
    chatId: Joi.string().required()
})

export const sendChatMessageValidator = Joi.object({
    content: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
    ).required(),
    participantsIds: Joi.array()
        .items(Joi.string().uuid({ version: 'uuidv4' }))
        .min(1)
        .required(),
    fromName: Joi.string().required()
});

export const createChatValidator = Joi.object({
    name: Joi.string()
        .max(255)
        .when('isGroup', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),

    isGroup: Joi.boolean().required(),

    participantIds: Joi.array()
        .items(Joi.string().uuid({ version: 'uuidv4' }))
        .min(1)
        .required()
});

export const createChatFilesValidator = Joi.object({
    photoFile: Joi.object({
        mimetype: Joi.string().valid('image/png', 'image/jpg', 'image/jpeg')
    }).unknown(true).optional().allow(null)
})

export const incrementChatParticipantValidator = Joi.object({
    chatId: Joi.string().required(),
    userId: Joi.string().required()
})