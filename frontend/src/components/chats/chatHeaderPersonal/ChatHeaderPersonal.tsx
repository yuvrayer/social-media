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
        ? 
            //if it is a group
            (chat.photoUrl?.startsWith(bucket) //does it has a photoUrl for the group, and it starts with the bucket?
            ? `${import.meta.env.VITE_AWS_SERVER_URL}/${chat.photoUrl}` //yes- make it the photo
            : chat.photoUrl?.startsWith("https://th.bing.com/") //does it start with it?
                ? chat.photoUrl //if yes- make it the photo url (for my pre-loaded data)
                : groupPicSource) //else- use my pre-loaded image (for group)
        :
            //if it is not a group 
            (otherUser?.profileImgUrl //does the other user has profileImgUrl?
            ? `${import.meta.env.VITE_AWS_SERVER_URL}/${otherUser.profileImgUrl}` //if yes- make it the image
            : profilePicSource); //else- use my pre-loaded image (for profile)

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
