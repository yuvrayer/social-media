import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'
import useName from '../../../hooks/useName'
import useProfileImg from '../../../hooks/useProfileImg'
import profilePicSource from '../../../assets/images/profile.jpg'
import Story from '../../posts/story/Story'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/auth/Auth'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import useService from '../../../hooks/useService'
import StoryService from "../../../services/auth-aware/Story"
import { init } from '../../../redux/storySlice'
import useUserId from '../../../hooks/useUserId'
import { v4 } from 'uuid'
import { init as initFollowing } from '../../../redux/followingSlice'
import { init as initProfile } from '../../../redux/profileSlice'
import { init as initFeed } from '../../../redux/feedSlice'
import { init as initStory } from '../../../redux/storySlice'
import { init as initFollowers } from '../../../redux/followers'
import { initISent as initFollowersRequestISent } from '../../../redux/followingRequestSlice'
import { initIReceived as initFollowersRequestIReceived } from '../../../redux/followingRequestSlice'
import 'bootstrap-icons/font/bootstrap-icons.css';
import FollowingRequest from '../../../services/auth-aware/followRequest'


export default function Header() {

    const name = useName()
    const userId = useUserId()

    const { logout } = useContext(AuthContext)!
    const navigate = useNavigate()

    const whoHasStory = useAppSelector(state => state.story.whoHasStory)
    const profileImgUrl = useProfileImg()
    const hasStory = whoHasStory.some(story => story.userId === userId);
    const storyImgUrl = whoHasStory.find(user => user.userId === userId)?.storyImgUrl || ``
    const storyService = useService(StoryService)
    const followingRequest = useService(FollowingRequest)

    const [viewedIds, setViewedIds] = useState<string[]>([])
    const friendRequestNumberIReceived = useAppSelector(state => state.followingRequests.followingRequestIReceived).length
    const count = useAppSelector(state => state.followers.pending)


    const dispatch = useAppDispatch()


    window.addEventListener('popstate', function (event) {
        event.preventDefault(); // Some browsers require this for custom messages
        logMeOut()
    })

    function logMeOut() {
        logout()
        dispatch(initFollowing([]))
        dispatch(initProfile([]))
        dispatch(initFeed([]))
        dispatch(initStory([]))
        dispatch(initFollowers([]))
        dispatch(initFollowersRequestISent([]))
        dispatch(initFollowersRequestIReceived([]))
        navigate(`/login`)
    }

    function followRequests() {
        navigate(`/followRequests`)
    }

    function navigateToUser() {
        navigate(`/user`)
    }

    useEffect(() => {
        (async () => {
            try {
                const stories = await storyService.getStoriesData(userId)
                dispatch(init(stories))
                const viewedStories = await storyService.getViewedStoryIds()
                const viewedUserUploads = viewedStories
                    .filter(s => s.userIdSaw === userId)
                    .map(s => s.userIdUploaded);
                setViewedIds(viewedUserUploads ? viewedUserUploads : [``])

                const requests = await followingRequest.getAllPendingRequestsIReceived()
                const requestsIds = requests.users.map(req => req.id)
                dispatch(initFollowersRequestIReceived(requestsIds))

                const followRequests = await followingRequest.getAllPendingRequestsISent()
                const followRequestsIdArray = followRequests.users.map(req => req.id)
                dispatch(initFollowersRequestISent(followRequestsIdArray))
            } catch (e) {
                alert(e)
            }
        })()
    }, [userId])

    async function reloadHeader(): Promise<void> {
        try {
            const stories = await storyService.getStoriesData(userId)
            dispatch(init(stories))
        } catch (e) {
            alert(e)
        }
    }


    return (
        <div className='Header'>
            <div className='Logo'>
                Logo
            </div>
            <div className='Story'>
                <Story key={v4()}
                    userDetails={{ name, profileImgUrl, hasStory, userId, storyImgUrl }}
                    currentUserId={userId}
                    viewedIds={viewedIds}
                    reloadHeader={reloadHeader}
                ></Story>
                {Array.from(
                    new Map(
                        whoHasStory
                            .filter(user => user.userId !== userId)
                            .map(user => [user.userId, user]) // create [userId, user] pairs
                    ).values() // only keep the unique users by userId
                ).map(user => (
                    <Story
                        key={user.userId}
                        userDetails={{
                            userId: user.userId,
                            name: user.name,
                            profileImgUrl: user.profileImgUrl,
                            hasStory: true,
                            storyImgUrl: user.storyImgUrl ?? ''
                        }}
                        viewedIds={viewedIds}
                        currentUserId={userId}
                        reloadHeader={reloadHeader}
                    />
                ))}

            </div>
            <div className='Navigation'>
                <nav>
                    <NavLink to="/profile">profile</NavLink>
                    <NavLink to="/feed">feed</NavLink>
                    <NavLink to="/search">search</NavLink>
                </nav>
            </div>
            <div className='Right'>
                <div className='RightTop'>
                    Hello {name} | {profileImgUrl && <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`} onClick={navigateToUser} />}
                    {!profileImgUrl && <img src={profilePicSource} onClick={navigateToUser} />} |
                    <i className="bi bi-box-arrow-right" onClick={logMeOut}> </i> |
                    <div className='personPlus'>
                        <i className="bi bi-person-plus" onClick={followRequests}></i>
                        {friendRequestNumberIReceived !== 0 && <span className="notification-badge">{friendRequestNumberIReceived > 10 ? '10+' : friendRequestNumberIReceived}</span>}
                    </div>
                </div>
            </div>
            <div className='RightBottom'>
                {!!count && <span className='info'>you have a new friend request!</span>}

            </div>
        </div>
    )
}