import './Follow.css'
import profilePicSource from '../../../assets/images/profile.jpg'
import LoadingButton from '../../common/loading-button/LoadingButton'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { unfollow as unfollowAction } from '../../../redux/followingSlice'
import FollowingService from '../../../services/auth-aware/Following'
import ProfileService from '../../../services/auth-aware/Profile'
import FollowingRequestService from '../../../services/auth-aware/followRequest'
import useService from '../../../hooks/useService'
import { setNewContent } from '../../../redux/feedSlice'
import { newFollower } from '../../../redux/followers'
import { deleteFollowRequestFromSliceIReceived, deleteFollowRequestFromSliceISent, followRequestUpdateSliceISent } from '../../../redux/followingRequestSlice'
import UserFillData from '../../../models/user/UserFillData'

interface FollowProps {
    userId: string,
    request?: boolean
}
export default function Follow(props: FollowProps): JSX.Element {

    const { userId } = props

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const dispatch = useAppDispatch()
    const isFollowingAlready = useAppSelector(state => state.following.following.findIndex(f => f.id === userId) > -1)
    const isFollowRequestSent = useAppSelector(state => state.followingRequests.followingRequestISent.some(Id => Id === userId))

    const followingService = useService(FollowingService)
    const profileService = useService(ProfileService)
    const followingRequestService = useService(FollowingRequestService)

    const [userData, setUserData] = useState<UserFillData>({
        name: "",
        profileImgUrl: "",
        id: ""
    })

    useEffect(() => {
        (async () => {
            const userDataFromServer = await profileService.fillUserData(userId)
            setUserData(userDataFromServer)
        })()
    }, [])

    async function unfollow() {
        if (window.confirm(`are you sure you wanna stop following ${userData.name}?`)) {
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
            await followingRequestService.sendFollowRequest(userId)
            dispatch(followRequestUpdateSliceISent(userId))
        } catch (e) {
            alert(e)
        }
    }

    async function follow() {
        try {
            setIsSubmitting(true)
            await followingService.follow(userId)
            dispatch(setNewContent(true))
            dispatch(newFollower(userData))
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
            <div> {userData.profileImgUrl ?
                <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${userData.profileImgUrl}`} />
                : <img src={profilePicSource} />
            }
            </div>
            <div>
                {userData.name}
            </div>
            <div> {
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
                </>}

                {
                    props.request && <>
                        <button className="v" onClick={follow}>V</button>
                        <button className="x" onClick={deleteFollowRequest}>X</button>
                    </>
                }
            </div>
        </div>
    )
}