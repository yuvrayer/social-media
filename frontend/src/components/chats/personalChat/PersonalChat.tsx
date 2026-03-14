import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Chat } from '../../../models/chat/Chat';
import ChatService from '../../../services/auth-aware/Chat';
import useService from '../../../hooks/useService';
import useUserId from '../../../hooks/useUserId';
import { useAppSelector } from '../../../redux/hooks';
import { initCurrentChatMessages } from '../../../redux/chatSlice';
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

    const messages = useAppSelector(state => state.chat.currentChatMessages)
    const [offset, setOffset] = useState(0);
    const pageSize = 40;
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const typingUser = useAppSelector(state => state.chat.typingUser);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load messages when offset changes or a new chat is opened
    useEffect(() => {
        async function loadMessages() {
            if (loadingMore || !hasMore) return; // Prevent duplicate fetching

            setLoadingMore(true);

            const container = messagesContainerRef.current;
            const prevScrollHeight = container?.scrollHeight ?? 0;

            try {
                const newMessages = await chatService.getMessages(chat.id, offset, pageSize);
                dispatch(initCurrentChatMessages(newMessages))

                if (newMessages.length < pageSize) setHasMore(false);

                // Restore scroll position after messages are loaded
                setTimeout(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - prevScrollHeight;
                    }
                }, 0);
            } catch (error) {
                console.error('Failed to load messages:', error);
            }

            setLoadingMore(false);
        }

        loadMessages();
    }, [offset, chat.id, hasMore, loadingMore]);

    // Scroll handler for pagination and bottom detection
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

            scrollTimeoutRef.current = setTimeout(() => {
                if (!container) return;

                const threshold = 20;

                // Trigger pagination if we are at the top of the container
                if (container.scrollTop < threshold && hasMore && !loadingMore) {
                    setOffset(prev => prev + pageSize);
                }

                // Track if we are at the bottom of the chat
                const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
                setIsAtBottom(atBottom);
            }, 100);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasMore, loadingMore]);


    return (
        <div className="personal-chat">
            <ChatHeaderPersonal chat={chat} userId={userId} onClose={onClose} />

            <div
                className="messages-container"
                ref={messagesContainerRef}
                style={{ overflowY: 'auto', height: '400px' }}
            >
                {messages.length === 0 && !loadingMore && (
                    <div className="empty-chat">No messages yet.</div>
                )}

                <ChatMessages
                    messages={messages}
                    userId={userId}
                    isAtBottom={isAtBottom}
                    onScrollToBottom={() => bottomRef.current?.scrollIntoView({ behavior: 'auto' })}
                    bottomRef={bottomRef}
                    containerRef={messagesContainerRef}
                    isGroup={chat.isGroup}
                />

                {loadingMore && (
                    <div style={{ textAlign: 'center', padding: '8px', fontSize: '14px' }}>
                        Loading more messages...
                    </div>
                )}

                {!hasMore && messages.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#888' }}>
                        You've reached the beginning of the chat.
                    </div>
                )}
            </div>

            {typingUser && <div className="typing-indicator">{typingUser} is typing...</div>}

            <ChatInput
                chatId={chat.id}
                chatParticipants={chat.participants?.map(p => p.id)}
            />
        </div>
    );
}
