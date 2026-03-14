import { ChangeEvent, FormEvent, useState } from "react"
import useService from "../../../hooks/useService"
import ChatService from "../../../services/auth-aware/Chat"
import useUserId from "../../../hooks/useUserId"
import useName from "../../../hooks/useName"
import "./StoryMessageInput.css"

interface StoryMessageInputProps {
    onInputChange(event: ChangeEvent<HTMLInputElement>): void
    userId: string
    imgSrc: string
}

export default function StoryMessageInput(props: StoryMessageInputProps) {
    const { onInputChange, userId, imgSrc } = props

    const myUserId = useUserId()
    const myName = useName()
    const chatService = useService(ChatService)

    const [message, setMessage] = useState<string>(``)

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            const chats = await chatService.getChats()

            // Replace with the user you're trying to message
            const targetUserId = userId

            // Step 1: Find a chat where participants include the target user
            const existingChat = chats.find(chat =>
                !chat.isGroup && chat.participants.some(user => user.id === targetUserId)
            );

            let chatIdCreated = null

            if (!existingChat) {
                alert("No chat with this user exists.");
                const formData = new FormData();
                formData.append(`isGroup`, String(false))
                const participantIds = [userId, myUserId]
                participantIds.forEach(id => formData.append('participantIds', id));
                try {
                    chatIdCreated = await chatService.createChat(formData)
                    alert("success.")
                } catch (e) {
                    alert(e)
                }
            }

            // Step 2: Send the message
            await chatService.sendMessage(existingChat ? existingChat.id : chatIdCreated!.id, {
                content: message,
                participantsIds: [userId, myUserId],
                fromName: myName,
                sentThroughStory: imgSrc
            });

            alert("sent message.")

            setMessage(``)

        } catch (e) {
            alert(e)
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        onInputChange(event); // Used to control progress bar pause
        setMessage(event.target.value); // Local state for input
    }

    return (
        <div className="StoryPopup-Wrapper">
            <form onSubmit={handleSubmit}>
                <input placeholder="send a message..."
                    value={message}
                    onChange={handleInputChange}></input>
                <button>send</button>
            </form>
        </div>
    )
}