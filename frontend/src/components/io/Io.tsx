/* eslint-disable no-case-declarations */
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../../redux/hooks";
import { addComment, newPost } from "../../redux/profileSlice";
import Post from "../../models/post/Post";
import { v4 } from "uuid";
import SocketMessages from "socket-enums-shaharsol";
import Comment from "../../models/comment/Comment";
import useUserId from "../../hooks/useUserId";
import { newFollowerAlert } from "../../redux/followers";
import { addMessageForCurrentChat, addUnreadChatMessage, addUserChatsChat, addUserChatsMessage } from "../../redux/chatSlice";
import { follow as IFollowFromNow } from "../../redux/followingSlice";

interface SocketContextInterface {
    xClientId: string
}

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<SocketContextInterface>({
    xClientId: ''
})

export default function Io(props: PropsWithChildren): JSX.Element {

    const { children } = props

    const [xClientId] = useState<string>(v4())
    const value = { xClientId }

    const dispatch = useAppDispatch()
    const userId = useUserId()

    useEffect(() => {
        const socket = io(import.meta.env.VITE_IO_SERVER_URL)

        if (userId) {
            socket.emit('join', userId);
            console.log(`User sent emit request to join room: ${userId}`);
        }

        socket.onAny((eventName, payload) => {
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
                            console.log('You have a new friend request!');
                        }
                        break;
                    case 'friendRequest:approved':
                        if (payload.to === userId) {
                            dispatch(IFollowFromNow(payload.userFillData))
                            console.log('Your friend request is approved');
                            alert("Your friend request is approved")
                        }
                        break;
                    case 'newMessage':
                        /// payload.to is array
                        if (Array.isArray(payload.to) && payload.to.includes(userId) && payload.from !== userId) {
                            dispatch(addUserChatsMessage(payload.message)) //add the new chat
                            dispatch(addUnreadChatMessage(payload.chatId)) //add a marker for unread message
                            dispatch(addMessageForCurrentChat(payload.message)) //add the message for display
                            console.log('You have a new chat message');
                        }
                        break;
                    case `newChat`:
                        if (Array.isArray(payload.to) && payload.to.includes(userId) && payload.from !== userId) {
                            dispatch(addUserChatsChat(payload.chat))
                            console.log(`You were added for a new chat by ${payload.from}`);
                        }
                        break;
                }
            }
        })

        return () => {
            socket.disconnect()
        }

    }, [dispatch, xClientId, userId])

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )

}