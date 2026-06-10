import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import paramsValidation from "../middlewares/params-validation";
import { chatParamsValidator, createChatFilesValidator, createChatValidator, incrementChatParticipantValidator, sendChatMessageValidator } from "../controllers/chats/validator";
import { createChat, getChatMessages, getChats, IncrementChatParticipant, markChatAsRead, sendChatMessage } from "../controllers/chats/controller";
import validation from "../middlewares/validation";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";

const chatsRouter = Router()

//checks if the user identified properly (runs on every call to the router)
chatsRouter.use(enforceAuth)

//gives all the chats
chatsRouter.get('/all', getChats)

//signs the specific chat as read
chatsRouter.patch('/chatRead/:chatId', paramsValidation(chatParamsValidator), markChatAsRead)

//create new chat
chatsRouter.post('/create', validation(createChatValidator), filesValidation(createChatFilesValidator), fileUploader, createChat)

//gives the messages of a specific chat by his Id
chatsRouter.get('/messages/:chatId', paramsValidation(chatParamsValidator), getChatMessages)

//sends a new message in a specific chat to the database
chatsRouter.post('/messages/:chatId', paramsValidation(chatParamsValidator), validation(sendChatMessageValidator), sendChatMessage)

//increase the unread messages in a specific chat. sends it to the database
chatsRouter.post('/incrementChatParticipant', validation(incrementChatParticipantValidator), IncrementChatParticipant)

export default chatsRouter