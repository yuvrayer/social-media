import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat } from "../models/chat/Chat";
import { Message } from "../models/chat/Message";

interface ChatState {
    unreadChatMessages: {
        [chatId: string]: number;
    }
    userChats: Chat[]
    currentChatMessages: Message[]
}

const initialState: ChatState = {
    unreadChatMessages: {},
    userChats: [],
    currentChatMessages: []
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
            state.unreadChatMessages[chatId] = 0;
        },
        //userChats
        initUserChats: (state, action: PayloadAction<Chat[]>) => {
            state.userChats = action.payload
        },
        addUserChatsMessage: (state, action: PayloadAction<Message>) => {
            const newMessage = action.payload;

            // Find the chat that this message belongs to
            const chatIndex = state.userChats.findIndex(chat => chat.id === newMessage.chatId);

            if (chatIndex !== -1) {
                // Update the lastMessage and updatedAt fields
                state.userChats[chatIndex].lastMessage = newMessage;
                state.userChats[chatIndex].updatedAt = newMessage.createdAt;

                // Move chat to the top of the list
                const updatedChat = state.userChats[chatIndex];
                state.userChats.splice(chatIndex, 1);
                state.userChats.unshift(updatedChat);
            }
        },
        addUserChatsChat: (state, action: PayloadAction<Chat>) => {
            state.userChats.unshift(action.payload)
        },
        //currentChatMessages
        initCurrentChatMessages: (state, action: PayloadAction<Message[]>) => {
            state.currentChatMessages = action.payload
        },
        addMessageForCurrentChat: (state, action: PayloadAction<Message>) => {
            state.currentChatMessages.push(action.payload)
        }
    }
})

export const { initUnreadChatMessages, addUnreadChatMessage, clearUnreadChatMessage, initUserChats, addUserChatsMessage, addUserChatsChat, initCurrentChatMessages, addMessageForCurrentChat } = chatSlice.actions

export default chatSlice.reducer
