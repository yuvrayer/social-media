import './Follow.css'
import profilePicSource from '../../../assets/images/profile.jpg'
import LoadingButton from '../../common/loading-button/LoadingButton'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { unfollow as unfollowAction } from '../../../redux/followingSlice'
import FollowingService from '../../../services/auth-aware/Following'
import FollowingRequestService from '../../../services/auth-aware/followRequest'
import useService from '../../../hooks/useService'
import { setNewContent } from '../../../redux/feedSlice'
import { newFollower, noLongerFollowUser } from '../../../redux/followers'
import { deleteFollowRequestFromSliceIReceived, deleteFollowRequestFromSliceISent, followRequestUpdateSliceISent } from '../../../redux/followingRequestSlice'
import useProfileImg from '../../../hooks/useProfileImg'
import useUserId from '../../../hooks/useUserId'
import useName from '../../../hooks/useName'

interface FollowProps {
    userId: string,
    request?: boolean,
    otherUserFillData: {
        name: string
        profileImgUrl: string
        id: string
    }
    stopFollowIndex: boolean
}
export default function Follow(props: FollowProps): JSX.Element {

    const { userId } = props

    const myName = useName()
    const myProfileImgUrl = useProfileImg()
    const myId = useUserId()

    const otherName = props.otherUserFillData.name
    const otherProfileImgUrl = props.otherUserFillData.profileImgUrl
    const otherId = props.otherUserFillData.id

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const dispatch = useAppDispatch()
    const isFollowingAlready = useAppSelector(state => state.following.following.findIndex(f => f.id === userId) > -1)
    const isFollowRequestSent = useAppSelector(state => state.followingRequests.followingRequestISent.some(Id => Id === userId))

    const followingService = useService(FollowingService)
    const followingRequestService = useService(FollowingRequestService)

    async function unfollow() {
        if (window.confirm(`are you sure you wanna stop following ${otherName}?`)) {
            try {
                setIsSubmitting(true)
                await followingService.unfollow(userId)
                dispatch(unfollowAction({ userId }))
                dispatch(setNewContent(true))
            } catch (e) {
                alert(e)
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    async function removeFollower() {
        if (window.confirm(`are you sure you wanna stop the permission from ${otherName} to follow you?`)) {
            try {
                setIsSubmitting(true)
                await followingService.removeFromMyFollowers(userId)
                dispatch(noLongerFollowUser({ userId }))
                dispatch(setNewContent(true))
            } catch (e) {
                alert(e)
            } finally {
                setIsSubmitting(false)
                alert("success")
            }
        }
    }


    async function deleteFollowRequest() {
        try {
            await followingRequestService.deleteFollowRequest(userId)
            dispatch(deleteFollowRequestFromSliceIReceived({ userId }))
        } catch (e) {
            alert(e)
        }
    }

    async function cancelFollowRequest() {
        try {
            await followingRequestService.cancelFollowRequest(userId)
            dispatch(deleteFollowRequestFromSliceISent({ userId }))
        } catch (e) {
            alert(e)
        }
    }


    async function sendFollowRequest() {
        try {
            await followingRequestService.sendFollowRequest(userId, { profileImgUrl: myProfileImgUrl, name: myName })
            dispatch(followRequestUpdateSliceISent(userId))
        } catch (e) {
            alert(e)
        }
    }

    async function follow() {
        try {
            setIsSubmitting(true)
            await followingService.follow(userId, { name: myName, id: myId, profileImgUrl: myProfileImgUrl })
            dispatch(setNewContent(true))
            dispatch(newFollower({ name: otherName, id: otherId, profileImgUrl: otherProfileImgUrl }))
            await deleteFollowRequest()
            dispatch(deleteFollowRequestFromSliceIReceived({ userId }))
        } catch (e) {
            alert(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='Follow'>
            {otherProfileImgUrl ?
                <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${otherProfileImgUrl}`} />
                : <img src={profilePicSource} />
            }
            <div className='Name'>
                {otherName}
            </div>
            {
                !props.request &&
                <>
                    {isFollowingAlready && <LoadingButton
                        onClick={unfollow}
                        isSubmitting={isSubmitting}
                        buttonText='Unfollow'
                        loadingText='Unfollowing...'
                    />}

                    {!isFollowingAlready && !isFollowRequestSent && <LoadingButton
                        onClick={sendFollowRequest}
                        isSubmitting={isSubmitting}
                        buttonText='Follow'
                        loadingText='Sending...'
                    />}

                    {!isFollowingAlready && isFollowRequestSent && <LoadingButton
                        onClick={cancelFollowRequest}
                        isSubmitting={isSubmitting}
                        buttonText='Request sent'
                        loadingText='Cancel...'
                    />}

                    {props.stopFollowIndex && <LoadingButton
                        onClick={removeFollower}
                        isSubmitting={isSubmitting}
                        buttonText='remove follower permission'
                        loadingText='Removing...'
                    />}

                </>}

            {props.request &&
                <div className='actions'>
                    <button className="v" onClick={follow}>✓</button>
                    <button className="x" onClick={deleteFollowRequest}>✕</button>
                </div>
            }
        </div>
    )
}