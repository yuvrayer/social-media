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

export default function Header() {

    const name = useName()
    const userId = useUserId()

    const { logout } = useContext(AuthContext)!
    const navigate = useNavigate()
    window.addEventListener('popstate', function (event) {
        event.preventDefault(); // Some browsers require this for custom messages
        logMeOut()
    })

    function logMeOut() {
        logout()
        navigate(`/login`)
    }

    function navigateToUser() {
        navigate(`/user`)
    }

    const whoHasStory = useAppSelector(state => state.story.whoHasStory)
    const profileImgUrl = useProfileImg()
    const hasStory = whoHasStory.some(story => story.userId === userId);
    const storyImgUrl = whoHasStory.find(user => user.userId === userId)?.storyImgUrl || ``
    const storyService = useService(StoryService)
    const [viewedIds, setViewedIds] = useState<string[]>([])

    const dispatch = useAppDispatch()

    useEffect(() => {
        (async () => {
            try {
                const stories = await storyService.getStoriesData()
                dispatch(init(stories))
                const viewedStories = await storyService.getViewedStoryIds()
                const viewedUserUploads = viewedStories
                    .filter(s => s.userIdSaw === userId)
                    .map(s => s.userIdUploaded);
                setViewedIds(viewedUserUploads ? viewedUserUploads : [``])

            } catch (e) {
                alert(e)
            }
        })()
    }, [])

    console.log(whoHasStory)

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
                Hello {name} | {profileImgUrl && <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`} onClick={navigateToUser} />} {!profileImgUrl && <img src={profilePicSource} onClick={navigateToUser} />}| <button onClick={logMeOut}>logout</button>
            </div>
        </div>
    )
}