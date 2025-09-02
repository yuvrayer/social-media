import { Chat as ChatModule } from "../../models/chat/Chat";
import { Message } from "../../models/chat/Message";
import { SendMessageDraft } from "../../models/chat/MessageDraft";
import AuthAware from "./AuthAware";


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
    async getMessages(chatId: string): Promise<Message[]> {
        const response = await this.axiosInstance.get<Message[]>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/messages/${chatId}`);
        return response.data;
    }

    // POST /chats/messages/:chatId
    async sendMessage(chatId: string, payload: SendMessageDraft): Promise<Message> {
        const response = await this.axiosInstance.post<Message>(`${import.meta.env.VITE_REST_SERVER_URL}/chats/messages/${chatId}`, payload);
        return response.data;
    }
}
