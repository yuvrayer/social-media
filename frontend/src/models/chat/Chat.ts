import User from "../user/User";
import { Message } from "./Message";

export interface Chat {
    id: string;
    name?: string;           // optional for private chats
    photoUrl?: string | null;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
    unreadMessages: number;
    lastMessage?: Message | null;

    participants: User[];
}