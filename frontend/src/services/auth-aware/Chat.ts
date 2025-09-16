import { Chat as ChatModule } from "../../models/chat/Chat";
import { Message } from "../../models/chat/Message";
import { SendMessageDraft } from "../../models/chat/MessageDraft";
import AuthAware from "./AuthAware";

interface incrementChatParticipantDraft {
    chatId: string,
    userId: string
}

export default class Chat extends AuthAware {

    // GET /chats/all
    async getChats(): Promise<ChatModule[]> {
        const response = await this.axiosInstance.get<ChatModule[]>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/all`);
        return response.data;
    }

    // POST /chats/create
    async createChat(payload: FormData): Promise<ChatModule> {
        const response = await this.axiosInstance.post<ChatModule>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/create`, payload);
        return response.data;
    }

    // GET /chats/messages/:chatId
    async getMessages(chatId: string, offset: number, limit: number): Promise<Message[]> {
        const response = await this.axiosInstance.get<Message[]>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/messages/${chatId}`, { params: { offset, limit } });
        return response.data;
    }

    // POST /chats/messages/:chatId
    async sendMessage(chatId: string, payload: SendMessageDraft): Promise<Message> {
        const response = await this.axiosInstance.post<Message>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/messages/${chatId}`, payload);
        return response.data;
    }

    // PATCH /chats/chatRead/:chatId
    async markChatAsRead(chatId: string): Promise<boolean> {
        const response = await this.axiosInstance.patch<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/chatRead/${chatId}`);
        return response.data;
    }

    // PATCH /chats/chatRead/:chatId
    async incrementChatParticipant(draft: incrementChatParticipantDraft): Promise<void> {
        const response = await this.axiosInstance.post<void>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/incrementChatParticipant`, draft);
        return response.data;
    }
}
