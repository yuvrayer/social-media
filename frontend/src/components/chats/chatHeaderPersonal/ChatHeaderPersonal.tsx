import profilePicSource from '../../../assets/images/profile.jpg';
import groupPicSource from '../../../assets/images/group.webp';
import { Chat } from '../../../models/chat/Chat';
import "../chatHeaderPersonal/ChatHeaderPersonal.css"

interface ChatHeaderPersonalProps {
    chat: Chat;
    userId: string;
    onClose: () => void;
}

export default function ChatHeaderPersonal({ chat, userId, onClose }: ChatHeaderPersonalProps) {
    const otherUser = chat.isGroup ? null : chat.participants.find(p => p.id !== userId);
    const bucket = "il.co.yuvalrayer";

    const avatarUrl = chat.isGroup
        ? (chat.photoUrl?.startsWith(bucket)
            ? `${import.meta.env.VITE_AWS_SERVER_URL}/${chat.photoUrl}`
            : chat.photoUrl?.startsWith("https://th.bing.com/")
                ? chat.photoUrl
                : groupPicSource)
        : (otherUser?.profileImgUrl
            ? `${import.meta.env.VITE_AWS_SERVER_URL}/${otherUser.profileImgUrl}`
            : profilePicSource);

    const displayName = chat.isGroup
        ? chat.name || "Group Chat"
        : otherUser?.name || "Private Chat";

    return (
        <div className="chat-header">
            <img src={avatarUrl} alt="Avatar" className="chat-avatar" />
            {!chat.isGroup && <span>{displayName}</span>}
            {chat.isGroup && (
                <div className="chat-header-text">
                    <span>{displayName}</span>
                    <span className="chat-subtitle">
                        {chat.participants?.map(p => p.name).join(', ')}
                    </span>
                </div>
            )}
            <button onClick={onClose}>✖</button>
        </div>
    );
}
