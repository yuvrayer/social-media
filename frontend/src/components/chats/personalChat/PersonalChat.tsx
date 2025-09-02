import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Chat } from '../../../models/chat/Chat';
import ChatService from '../../../services/auth-aware/Chat';
import useService from '../../../hooks/useService';
import useUserId from '../../../hooks/useUserId';
import { useAppSelector } from '../../../redux/hooks';
import { initCurrentChatMessages, addMessageForCurrentChat, addUserChatsMessage } from '../../../redux/chatSlice';
import ChatHeaderPersonal from '../chatHeaderPersonal/ChatHeaderPersonal';
import ChatMessages from '../chatMessages/chatMessages';
import ChatInput from '../chatInput/chatInput';
import './PersonalChat.css';

interface PersonalChatProps {
    chat: Chat;
    onClose: () => void;
}

export default function PersonalChat({ chat, onClose }: PersonalChatProps) {
    const userId = useUserId();
    const chatService = useService(ChatService);
    const dispatch = useDispatch();

    const messages = useAppSelector(state => state.chat.currentChatMessages);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Load messages
    useEffect(() => {
        async function fetchMessages() {
            try {
                const fetchedMessages = await chatService.getMessages(chat.id);
                dispatch(initCurrentChatMessages(fetchedMessages));
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        }
        fetchMessages();
    }, [chat.id]);

    // Scroll behavior
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const threshold = 50;
            const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
            setIsAtBottom(atBottom);
            if (atBottom) setUnreadCount(0);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        } else {
            setUnreadCount(prev => prev + 1);
        }
    }, [messages]);

    const handleSend = async (content: string) => {
        try {
            const sentMessage = await chatService.sendMessage(chat.id, {
                content,
                participantsIds: chat.participants.map(p => p.id)
            });
            dispatch(addMessageForCurrentChat(sentMessage));
            dispatch(addUserChatsMessage(sentMessage));
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="personal-chat">
            <ChatHeaderPersonal chat={chat} userId={userId} onClose={onClose} />
            <ChatMessages
                messages={messages}
                userId={userId}
                unreadCount={unreadCount}
                isAtBottom={isAtBottom}
                onScrollToBottom={() => bottomRef.current?.scrollIntoView({ behavior: 'auto' })}
                containerRef={messagesContainerRef}
                bottomRef={bottomRef}
                isGroup={chat.isGroup}
            />
            <ChatInput onSend={handleSend} />
        </div>
    );
}
