import { Message } from '../../../models/chat/Message';
import "./chatMessages.css"

interface ChatMessagesProps {
    messages: Message[];
    userId: string;
    unreadCount: number;
    isAtBottom: boolean;
    onScrollToBottom: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
    bottomRef: React.RefObject<HTMLDivElement>;
    isGroup: boolean
}

export default function ChatMessages({
    messages,
    userId,
    unreadCount,
    isAtBottom,
    onScrollToBottom,
    containerRef,
    bottomRef,
    isGroup
}: ChatMessagesProps) {

    function formatDateLabel(dateString: string): string {
        const today = new Date();
        const date = new Date(dateString);

        const isToday = date.toDateString() === today.toDateString();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }

    const groupedByDate = messages.reduce((acc: Record<string, Message[]>, msg) => {
        const date = new Date(msg.createdAt).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(msg);
        return acc;
    }, {});

    return (
        <div className="chat-messages" ref={containerRef}>
            {Object.entries(groupedByDate).map(([date, msgs]) => (
                <div key={date}>
                    <div className="date-divider">{formatDateLabel(date)}</div>
                    {msgs.map(msg => (
                        <div key={msg.id} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>
                            <span className="message-content">{msg.content}</span>
                            {isGroup && userId !== msg.senderId && <span className="message-sender">{msg.sender?.name}</span>}
                            <span className="message-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
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
