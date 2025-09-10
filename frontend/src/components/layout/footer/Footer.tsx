import './Footer.css';
import { useEffect, useState } from 'react';
import useService from '../../../hooks/useService';
import ChatService from '../../../services/auth-aware/Chat';
import { useAppSelector } from '../../../redux/hooks';
import { useDispatch } from 'react-redux';
import { initUserChats, addUserChatsChat, clearUnreadChatMessage, initUnreadChatMessages, setCurrentChatIdToSlice } from '../../../redux/chatSlice';
import { Chat } from '../../../models/chat/Chat';
import ChatWindow from '../../chats/chatWindow/ChatWindow';

export default function Footer() {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);

    const chatsService = useService(ChatService);
    const dispatch = useDispatch();
    const unreadCount = useAppSelector(state => state.chat.unreadChatMessages);
    const totalUnread = Object.values(unreadCount).reduce((sum, count) => sum + count, 0);

    const toggleChat = () => {
        if (isChatOpen) {
            dispatch(setCurrentChatIdToSlice(null))
        }
        setIsChatOpen(!isChatOpen);
    }

    async function fetchChats() {
        try {
            const chatsFromServer = await chatsService.getChats();
            dispatch(initUserChats(chatsFromServer));
            const unreadMap: { [chatId: string]: number } = {};
            chatsFromServer.forEach((chat: Chat) => {
                unreadMap[chat.id] = chat.unreadMessages ?? 0;
            });
            // Dispatch init
            dispatch(initUnreadChatMessages(unreadMap));
        } catch (e) {
            alert(e);
        }
    }

    useEffect(() => {
        fetchChats();
    }, [isChatOpen]);

    return (
        <>
            <div className='Footer'>
                <p>server is: {import.meta.env.VITE_REST_SERVER_URL}</p>
            </div>

            <div className="chat-tab" onClick={toggleChat}>
                💬 Chat
                {totalUnread > 0 && (
                    <span className="chat-unread-badge">{totalUnread}</span>
                )}
            </div>

            {isChatOpen && (
                <ChatWindow
                    selectedChat={selectedChat}
                    isNewChatModalOpen={isNewChatModalOpen}
                    setIsNewChatModalOpen={setIsNewChatModalOpen}
                    onClose={() => {
                        toggleChat()
                        setSelectedChat(null)
                    }}
                    onChatCreated={(chat: Chat) => {
                        dispatch(addUserChatsChat(chat));
                        setSelectedChat(chat);
                        setIsNewChatModalOpen(false);
                        dispatch(setCurrentChatIdToSlice(chat.id))
                    }}
                    onChatSelected={async (chat: Chat) => {
                        setSelectedChat(chat);
                        dispatch(setCurrentChatIdToSlice(chat.id))

                        try {
                            await chatsService.markChatAsRead(chat.id);
                            dispatch(clearUnreadChatMessage(chat.id));
                        } catch (err) {
                            console.error('Failed to mark chat as read', err);
                        }
                    }}
                />
            )}
        </>
    );
}
