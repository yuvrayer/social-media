import NewChat from '../../chats/newChat/NewChat';
import PersonalChat from '../../chats/personalChat/PersonalChat';
import ChatHeaderFooter from '../chatHeaderFooter/ChatHeaderFooter';
import ChatList from '../chatList/ChatList';
import { Chat } from '../../../models/chat/Chat';
import "./ChatWindow.css"

interface ChatWindowProps {
    selectedChat: Chat | null;
    isNewChatModalOpen: boolean;
    setIsNewChatModalOpen: (val: boolean) => void;
    onClose: () => void;
    onBackToChats: () => void;
    onChatCreated: (chat: Chat) => void;
    onChatSelected: (chat: Chat) => void;
}

export default function ChatWindow({
    selectedChat,
    isNewChatModalOpen,
    setIsNewChatModalOpen,
    onClose,
    onChatCreated,
    onChatSelected,
    onBackToChats
}: ChatWindowProps) {
    return (
        <div className="chat-window">
            {isNewChatModalOpen && (
                <NewChat onClose={() => setIsNewChatModalOpen(false)} onChatCreated={onChatCreated} />
            )}

            {selectedChat ? (
                <PersonalChat chat={selectedChat} onClose={onBackToChats} />
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
