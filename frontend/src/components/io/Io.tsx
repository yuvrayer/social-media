/* eslint-disable no-case-declarations */
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { addComment, newPost } from "../../redux/profileSlice";
import Post from "../../models/post/Post";
import { v4 } from "uuid";
import SocketMessages from "socket-enums-shaharsol";
import Comment from "../../models/comment/Comment";
import useUserId from "../../hooks/useUserId";
import { addMessageForCurrentChat, addUnreadChatMessage, addUserChatsChat, addUserChatsMessage, setTypingIndicator } from "../../redux/chatSlice";
import { follow as IFollowFromNow } from "../../redux/followingSlice";
import { useRef } from 'react';
import { addFollowRequestFromSliceIReceived, deleteFollowRequestFromSliceISent, newFollowerAlert } from "../../redux/followingRequestSlice";
import useService from "../../hooks/useService";
import ChatService from "../../services/auth-aware/Chat"

interface SocketContextInterface {
    xClientId: string
    socket: Socket | null
}

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<SocketContextInterface>({
    xClientId: '',
    socket: null
})

export default function Io(props: PropsWithChildren): JSX.Element {

    const { children } = props

    const [xClientId] = useState<string>(v4())
    const [mySocket, setSocket] = useState<Socket | null>(null);

    const dispatch = useAppDispatch()
    const userId = useUserId()

    const chatService = useService(ChatService)

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentChatId = useAppSelector(state => state.chat.currentChatId)

    useEffect(() => {
        const socket = io(import.meta.env.VITE_IO_SERVER_URL)
        setSocket(socket)

        if (userId) {
            socket.emit('join', userId);
            console.log(`User sent emit request to join room: ${userId}`);
        }

        socket.onAny(async (eventName, payload) => {
            // should we even respond?
            // in other words:
            // if this event was initiate by "us"
            // then we should ignore it

            console.log(eventName, payload)

            if (payload.from !== xClientId) {
                switch (eventName) {
                    case SocketMessages.NEW_POST:
                        const newPostPayload = payload.data as Post
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        // const isFollowing = useAppSelector(state => state.following.following.findIndex(f => f.id === newPostPayload.userId) > -1)
                        if (newPostPayload.userId === userId) {
                            dispatch(newPost(newPostPayload))
                        }
                        // if (isFollowing) {
                        //     dispatch(setNewContent(true))
                        // } 
                        break;
                    case SocketMessages.NEW_COMMENT:
                        const newCommentPayload = payload.data as Comment
                        dispatch(addComment(newCommentPayload))
                        break;
                    case 'friendRequest:new':
                        if (payload.to === userId) {
                            dispatch(newFollowerAlert(true))
                            dispatch(addFollowRequestFromSliceIReceived({
                                id: payload.from,
                                name: payload.name,
                                profileImgUrl: payload.profileImgUrl
                            }))
                            console.log('You have a new friend request!');
                        }
                        break;
                    case 'friendRequest:deleted':
                        if (payload.to === userId) {
                            dispatch(deleteFollowRequestFromSliceISent({ userId: payload.from }))
                            console.log('Your friend request declined!');
                        }
                        break;
                    case 'friendRequest:approved':
                        if (payload.to === userId) {
                            //userFillData = the sender data (the user that approved)
                            dispatch(IFollowFromNow(payload.userFillData))
                            dispatch(deleteFollowRequestFromSliceISent({ userId: payload.userFillData.id }))
                            console.log('Your friend request is approved');
                            alert("Your friend request is approved")
                        }
                        break;
                    case 'newMessage':
                        /// payload.to is array
                        if (Array.isArray(payload.to) && payload.to.includes(userId) && payload.from !== userId) {
                            dispatch(addUserChatsMessage(payload.message)) //add the new chat to the redux (to present last message)

                            if (payload.chatId === currentChatId)
                                dispatch(addMessageForCurrentChat({ message: payload.message, senderName: payload.fromName })) //add the message for display (state)
                            else {
                                try {
                                    await chatService.incrementChatParticipant({ userId: payload.from, chatId: payload.chatId })
                                    dispatch(addUnreadChatMessage(payload.chatId));
                                } catch (e) {
                                    alert(e)
                                }
                            }

                            console.log('You have a new chat message');
                        }
                        break;
                    case `newChat`:
                        if (Array.isArray(payload.to) && payload.to.includes(userId) && payload.from !== userId) {
                            dispatch(addUserChatsChat(payload.chat))
                            console.log(`You were added for a new chat by ${payload.from}`);
                        }
                        break;
                    case 'userTyping':
                        if (payload.chatId === currentChatId && payload.from !== userId) {
                            dispatch(setTypingIndicator(payload.fromName));

                            // Clear existing timeout if exists
                            if (typingTimeoutRef.current) {
                                clearTimeout(typingTimeoutRef.current);
                            }

                            // Set new timeout
                            typingTimeoutRef.current = setTimeout(() => {
                                dispatch(setTypingIndicator(null));
                            }, 2000); // or any duration you like
                        }
                        break;

                }
            }
        })

        return () => {
            socket.disconnect()
        }

    }, [dispatch, xClientId, userId, currentChatId])

    return (
        <SocketContext.Provider value={{ xClientId, socket: mySocket }}>
            {children}
        </SocketContext.Provider>
    )

}