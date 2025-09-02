import NewChat from '../../chats/newChat/NewChat';
import PersonalChat from '../../chats/personalChat/PersonalChat';
import ChatHeaderFooter from '../chatHeaderFooter/ChatHeaderFooter';
import ChatList from '../chatList/ChatList';
import { Chat } from '../../../models/chat/Chat';
import "./ChatWindow.css"

interface ChatWindowProps {
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
    isNewChatModalOpen: boolean;
    setIsNewChatModalOpen: (val: boolean) => void;
    onClose: () => void;
    onChatCreated: (chat: Chat) => void;
    onChatSelected: (chat: Chat) => void;
}

export default function ChatWindow({
    selectedChat,
    setSelectedChat,
    isNewChatModalOpen,
    setIsNewChatModalOpen,
    onClose,
    onChatCreated,
    onChatSelected,
}: ChatWindowProps) {
    return (
        <div className="chat-window">
            {isNewChatModalOpen && (
                <NewChat onClose={() => setIsNewChatModalOpen(false)} onChatCreated={onChatCreated} />
            )}

            {selectedChat ? (
                <PersonalChat chat={selectedChat} onClose={() => setSelectedChat(null)} />
            ) : (
                <>
                    <ChatHeaderFooter
                        onNewChatClick={() => setIsNewChatModalOpen(true)}
                        onClose={onClose}
                    />
                    <ChatList onSelectChat={onChatSelected} />
                </>
            )}
        </div>
    );
}
