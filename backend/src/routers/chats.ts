import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import paramsValidation from "../middlewares/params-validation";
import { chatParamsValidator, createChatFilesValidator, createChatValidator, incrementChatParticipantValidator, sendChatMessageValidator } from "../controllers/chats/validator";
import { createChat, getChatMessages, getChats, IncrementChatParticipant, markChatAsRead, sendChatMessage } from "../controllers/chats/controller";
import validation from "../middlewares/validation";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";

const chatsRouter = Router()

chatsRouter.use(enforceAuth)

chatsRouter.get('/all', getChats)
chatsRouter.patch('/chatRead/:chatId', paramsValidation(chatParamsValidator), markChatAsRead)
chatsRouter.post('/create', validation(createChatValidator), filesValidation(createChatFilesValidator), fileUploader, createChat)
chatsRouter.get('/messages/:chatId', paramsValidation(chatParamsValidator), getChatMessages)
chatsRouter.post('/messages/:chatId', paramsValidation(chatParamsValidator), validation(sendChatMessageValidator), sendChatMessage)
chatsRouter.post('/incrementChatParticipant', validation(incrementChatParticipantValidator), IncrementChatParticipant)

export default chatsRouter