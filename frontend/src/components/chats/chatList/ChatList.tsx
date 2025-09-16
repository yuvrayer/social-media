import ChatListItem from '../../chats/chatListItem/ChatListItem';
import { useAppSelector } from '../../../redux/hooks';
import useUserId from '../../../hooks/useUserId';
import groupPicSource from '../../../assets/images/group.webp';
import profilePicSource from '../../../assets/images/profile.jpg';
import { Chat } from '../../../models/chat/Chat';
import "./ChatList.css"

interface ChatListProps {
    onSelectChat: (chat: Chat) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
    const chats = useAppSelector(state => state.chat.userChats);
    const unreadCount = useAppSelector(state => state.chat.unreadChatMessages);
    console.log(unreadCount)
    const userId = useUserId();

    function getChatDisplayName(chat: Chat) {
        if (chat.isGroup) return chat.name || "Group Chat";
        const other = chat.participants?.find(p => p.id !== userId);
        return other?.name || "Unknown";
    }

    function getChatAvatarUrl(chat: Chat): string {
        if (chat.isGroup) return chat.photoUrl || groupPicSource;
        const other = chat.participants?.find(p => p.id !== userId);
        return other?.profileImgUrl || profilePicSource;
    }

    return (
        <div className="chat-body">
            {chats.map(chat => {
                const lastMessage = chat.lastMessage;
                return (
                    <ChatListItem
                        key={chat.id}
                        name={getChatDisplayName(chat)}
                        lastMessage={lastMessage?.content ?? 'No messages yet'}
                        timestampLastMessage={new Date(lastMessage?.createdAt ?? chat.updatedAt)}
                        unreadCount={unreadCount[chat.id] ?? 0}
                        avatarUrl={getChatAvatarUrl(chat)}
                        onClick={() => onSelectChat(chat)}
                    />
                );
            })}
        </div>
    );
}
