import "./ChatHeaderFooter.css"

interface ChatHeaderProps {
    onNewChatClick: () => void;
    onClose: () => void;
}

export default function ChatHeaderFooter({ onNewChatClick, onClose }: ChatHeaderProps) {
    return (
        <div className="chat-header">
            <span>My Chats</span>
            <div>
                <button onClick={onNewChatClick}>➕ New Chat</button>
                <button onClick={onClose}>✖</button>
            </div>
        </div>
    );
}
