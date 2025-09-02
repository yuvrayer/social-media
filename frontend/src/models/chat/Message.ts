import User from "../user/User";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string | number;         // can be text or URL to image/file/etc.
  createdAt: string;

  sender?: User;
}

