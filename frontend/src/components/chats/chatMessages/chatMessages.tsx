import { Message } from '../../../models/chat/Message';
import { useAppSelector } from '../../../redux/hooks';
import './chatMessages.css';

interface ChatMessagesProps {
    messages: Message[];
    userId: string;
    isAtBottom: boolean;
    onScrollToBottom: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    isGroup: boolean;
}

export default function ChatMessages({
    messages,
    userId,
    isAtBottom,
    onScrollToBottom,
    containerRef,
    bottomRef,
    isGroup,
}: ChatMessagesProps) {

    const unreadCount = useAppSelector(state => state.chat.unreadChatMessagesForChatMessages)

    // Function to format the date label (Today, Yesterday, or specific date)
    function formatDateLabel(dateString: string): string {
        const today = new Date();
        const date = new Date(dateString);

        const isToday = date.toDateString() === today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';

        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    }

    // Group messages by date and ensure no duplicates in the flattened messages array
    const groupedByDate = messages.reduce((acc: Record<string, Message[]>, msg) => {
        const date = new Date(msg.createdAt).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {});

    // Flatten the grouped messages while ensuring no duplicates by checking the message `id`
    const flattenedMessages = Object.values(groupedByDate)
        .flat()
        .filter((msg, index, self) => index === self.findIndex((m) => m.id === msg.id));

    // Determine where to place the "Unread messages" banner (index of the first unread message)
    const unreadStartIndex = unreadCount > 0 ? flattenedMessages.length - unreadCount : -1;

    return (
        <div className="chat-messages" ref={containerRef}>
            {Object.entries(groupedByDate).map(([date, msgs]) => (
                <div key={date}>
                    <div className="date-divider">{formatDateLabel(date)}</div>
                    {msgs.map((msg) => {
                        const absoluteIndex = flattenedMessages.findIndex(m => m.id === msg.id);

                        return (
                            <div key={msg.id}> {/* Ensure each message has a unique key */}
                                {/* Show unread banner only once */}
                                {absoluteIndex === unreadStartIndex && (
                                    <div className="unread-banner">Unread messages</div>
                                )}

                                <div className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
                                    {/* ✅ Image if sent through story */}
                                    {msg.sentThroughStory && (
                                        <> {msg.senderId === userId ? 'replayed on their story:' : 'replayed on your story:'} <br />
                                            <img
                                                src={msg.sentThroughStory}
                                                alt="Story"
                                                className="story-image"
                                            /> <br />
                                        </>
                                    )}
                                    <span className="message-content">{msg.content}</span>
                                    {isGroup && userId !== msg.senderId && (
                                        <span className="message-sender">
                                            {msg.sender?.name ?? msg.senderName}
                                        </span>
                                    )}
                                    <span className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div ref={bottomRef} />

            {unreadCount > 0 && !isAtBottom && (
                <button className="scroll-to-bottom-btn" onClick={onScrollToBottom}>
                    ⬇ {unreadCount}
                </button>
            )}
        </div>
    );
}
