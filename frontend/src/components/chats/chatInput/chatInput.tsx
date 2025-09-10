import { useState } from 'react';
import "./chatInput.css"
import useSocket from '../../../hooks/useSocket';
import useName from '../../../hooks/useName';
import useUserId from '../../../hooks/useUserId';

interface ChatInputProps {
    onSend: (message: string) => void;
    chatId: string,
    chatParticipants: string[]
}

export default function ChatInput({ onSend, chatId, chatParticipants }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const { socket } = useSocket()
    const userName = useName()
    const userId = useUserId()

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
    };

    const handleTyping = (text: string) => {
        setMessage(text);

        // Emit "writing" event
        socket?.emit('writing', {
            chatId,
            from: userId,
            fromName: userName,
            to: chatParticipants ?? []
        });
    };

    return (
        <div className="chat-input">
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
}
