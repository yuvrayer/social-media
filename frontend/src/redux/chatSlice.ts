import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat } from "../models/chat/Chat";
import { Message } from "../models/chat/Message";

interface ChatState {
    unreadChatMessages: {
        [chatId: string]: number;
    } //for the chat lists numbers (in red)
    unreadChatMessagesForChatMessages: number; //for unread messages flag
    userChats: Chat[] //for display the personal chats the users is a participant
    currentChatMessages: Message[] //the chat messages
    typingUser: string | null //indicator for typing
    currentChatId: string | null; //the chat id the user opened (for taking its messages)
}

const initialState: ChatState = {
    unreadChatMessages: {},
    unreadChatMessagesForChatMessages: 0,
    userChats: [],
    currentChatMessages: [],
    typingUser: null,
    currentChatId: null
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        //unreadChatMessages
        initUnreadChatMessages: (state, action: PayloadAction<{ [chatId: string]: number }>) => {
            state.unreadChatMessages = action.payload
        },
        addUnreadChatMessage: (state, action: PayloadAction<string>) => {
            const chatId = action.payload;
            state.unreadChatMessages[chatId] =
                (state.unreadChatMessages[chatId] || 0) + 1;
        },
        clearUnreadChatMessage: (state, action: PayloadAction<string>) => {
            const chatId = action.payload;
            state.unreadChatMessagesForChatMessages = state.unreadChatMessages[chatId] //save the number. for unread messages flag
            state.unreadChatMessages[chatId] = 0;
        },
        addUserChatsMessage: (state, action: PayloadAction<Message>) => {

            // Find the chat that this message belongs to
            const chatIndex = state.userChats.findIndex(chat => chat.id === action.payload.chatId);

            if (chatIndex !== -1) {
                // Update the lastMessage and updatedAt fields
                state.userChats[chatIndex].lastMessage = action.payload;
                state.userChats[chatIndex].updatedAt = action.payload.createdAt;

                // Move chat to the top of the list
                const updatedChat = state.userChats[chatIndex];
                state.userChats.splice(chatIndex, 1);
                state.userChats.unshift(updatedChat);
            }
        },

        //userChats
        initUserChats: (state, action: PayloadAction<Chat[]>) => {
            state.userChats = action.payload
        },
        addUserChatsChat: (state, action: PayloadAction<Chat>) => {
            state.userChats.unshift(action.payload)
        },

        //currentChatMessages
        initCurrentChatMessages: (state, action: PayloadAction<Message[]>) => {
            state.currentChatMessages = action.payload
        },
        addMessageForCurrentChat: (state, action: PayloadAction<{ message: Message, senderName: string }>) => {

            const { message, senderName } = action.payload;

            // Clone the message to avoid mutating a frozen object
            const safeMessage = !message.sender
                ? { ...message, senderName }
                : message;

            state.currentChatMessages.push(safeMessage)
        },
        //typingIndicator
        setTypingIndicator: (state, action: PayloadAction<string | null>) => {
            state.typingUser = action.payload
        },
        //currentChatId
        setCurrentChatIdToSlice: (state, action: PayloadAction<string | null>) => {
            state.currentChatId = action.payload;
        }
    }
})

export const {
    initUnreadChatMessages,
    addUnreadChatMessage,
    clearUnreadChatMessage,
    initUserChats,
    addUserChatsMessage,
    addUserChatsChat,
    initCurrentChatMessages,
    addMessageForCurrentChat,
    setTypingIndicator,
    setCurrentChatIdToSlice,
} = chatSlice.actions

export default chatSlice.reducer
