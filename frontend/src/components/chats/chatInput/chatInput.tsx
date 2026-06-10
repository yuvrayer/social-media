import { useState } from 'react';
import "./chatInput.css"
import useSocket from '../../../hooks/useSocket';
import useName from '../../../hooks/useName';
import useUserId from '../../../hooks/useUserId';
import { addMessageForCurrentChat, addUserChatsMessage, clearUnreadChatMessage } from '../../../redux/chatSlice';
import useService from '../../../hooks/useService';
import ChatService from '../../../services/auth-aware/Chat';
import { useDispatch } from 'react-redux';

interface ChatInputProps {
    chatId: string,
    chatParticipants: string[]
}

export default function ChatInput({ chatId, chatParticipants }: ChatInputProps) {

    const [message, setMessage] = useState('');
    const { socket } = useSocket()
    const name = useName()
    const userId = useUserId()
    const chatService = useService(ChatService);
    const dispatch = useDispatch();

    // Handle sending a new message
    const handleSend = async () => {
        if (!message.trim()) return;
        try {
            //send the message to the database
            const sentMessage = await chatService.sendMessage(chatId, {
                content: message,
                participantsIds: chatParticipants,
                fromName: name,
            });

            //UI calls for the redux
            dispatch(addMessageForCurrentChat({ message: sentMessage, senderName: name }));
            dispatch(addUserChatsMessage(sentMessage));
            dispatch(clearUnreadChatMessage(chatId))
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };


    const handleTyping = (text: string) => {
        setMessage(text);

        // Emit "writing" event through the socket
        socket?.emit('writing', {
            chatId,
            from: userId,
            fromName: name,
            to: chatParticipants ?? []
        });
    };

     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input">
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
}
