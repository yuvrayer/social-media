import './ChatListItem.css';

interface ChatListItemProps {
    name: string;
    lastMessage: string | number;
    timestampLastMessage: Date;
    unreadCount?: number;
    avatarUrl?: string;
    onClick?: () => void;
}

export default function ChatListItem(props: ChatListItemProps) {

    const {
        name,
        lastMessage,
        timestampLastMessage,
        avatarUrl,
        onClick,
    } = props

    const unreadCount = props.unreadCount ?? 0;


    function formatDateLabel(date: Date): string {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        if (isToday) {
            return `${hours}:${minutes}`;
        }

        if (isYesterday) {
            return 'Yesterday';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }


    return (
        <div className="chat-list-item" onClick={onClick}>
            <img
                src={avatarUrl?.startsWith(`il.co.yuvalrayer`)
                    ? import.meta.env.VITE_AWS_SERVER_URL + `/` + avatarUrl
                    : avatarUrl}
                alt={name}
                className="avatar"
            />
            <div className="chat-info">
                <div className="top-row">
                    <span className="chat-name">{name}</span>
                    <span className="chat-time">{formatDateLabel(timestampLastMessage)}</span>
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
