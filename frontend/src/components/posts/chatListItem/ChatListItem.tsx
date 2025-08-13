// ChatListItem.tsx
import React from 'react';
import './ChatListItem.css';

interface ChatListItemProps {
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount?: number;
    avatarUrl?: string;
    onClick?: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
    name,
    lastMessage,
    timestamp,
    unreadCount = 0,
    avatarUrl,
    onClick,
}) => {
    return (
        <div className="chat-list-item" onClick={onClick}>
            <img
                src={avatarUrl || 'https://via.placeholder.com/40'}
                alt={name}
                className="avatar"
            />
            <div className="chat-info">
                <div className="top-row">
                    <span className="chat-name">{name}</span>
                    <span className="chat-time">{timestamp}</span>
                </div>
                <div className="bottom-row">
                    <span className="last-message">{lastMessage}</span>
                    {unreadCount > 0 && (
                        <span className="unread-badge">{unreadCount}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatListItem;
