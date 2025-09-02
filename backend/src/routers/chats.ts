import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import paramsValidation from "../middlewares/params-validation";
import { chatParamsValidator, createChatFilesValidator, createChatValidator, sendChatMessagesValidator } from "../controllers/chats/validator";
import { createChat, getChatMessages, getChats, sendChatMessages } from "../controllers/chats/controller";
import validation from "../middlewares/validation";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";

const chatsRouter = Router()

chatsRouter.use(enforceAuth)

chatsRouter.get('/all', getChats)
chatsRouter.post('/create', validation(createChatValidator), filesValidation(createChatFilesValidator), fileUploader, createChat)
chatsRouter.get('/messages/:chatId', paramsValidation(chatParamsValidator), getChatMessages)
chatsRouter.post('/messages/:chatId', paramsValidation(chatParamsValidator), validation(sendChatMessagesValidator), sendChatMessages)

export default chatsRouter