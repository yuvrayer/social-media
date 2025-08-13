import { useState } from 'react';
import './Footer.css'
import ChatListItem from '../../posts/chatListItem/ChatListItem';

export default function Footer() {

    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }
    const chats = [
        {
            name: 'Alice',
            lastMessage: 'See you tomorrow!',
            timestamp: '10:45 AM',
            unreadCount: 2,
            avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        },
        {
            name: 'Study Group',
            lastMessage: 'Don’t forget the assignment.',
            timestamp: '09:15 AM',
            unreadCount: 0,
            avatarUrl: 'https://via.placeholder.com/40?text=G',
        },
        {
            name: 'Bob',
            lastMessage: 'Got it, thanks!',
            timestamp: 'Yesterday',
            unreadCount: 1,
            avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        },
    ]

    return (
        <>
            <div className='Footer'>
                <p>server is: {import.meta.env.VITE_REST_SERVER_URL}</p>
            </div>
            {/* Chat Tab */}
            <div className="chat-tab" onClick={toggleChat}>
                💬 Chat
            </div>

            {/* Chat Window */}
            {isChatOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <span>My Chats</span>
                        <button onClick={toggleChat}>✖</button>
                    </div>
                    <div className="chat-body">
                        {chats.map((chat, index) => (
                            <ChatListItem
                                key={index}
                                name={chat.name}
                                lastMessage={chat.lastMessage}
                                timestamp={chat.timestamp}
                                unreadCount={chat.unreadCount}
                                avatarUrl={chat.avatarUrl}
                                onClick={() => alert(`Open chat with ${chat.name}`)}
                            />
                        ))}                        {/* You can expand this into a full chat UI */}
                    </div>
                </div>
            )}
        </>
    )
}