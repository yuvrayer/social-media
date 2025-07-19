import './Story.css'
import StoryModel from "../../../models/story/Story"
import StoryService from "../../../services/auth-aware/Story"
import useService from '../../../hooks/useService'
import { newStory } from '../../../redux/storySlice'
import { useAppDispatch } from '../../../redux/hooks'
import { useEffect, useRef, useState } from 'react'
import profilePicSource from '../../../assets/images/profile.jpg'
import StoryPopup from '../story-pop/Storypop'

interface StoryProps {
    userDetails: StoryModel,
    currentUserId: string,
    viewedIds: string[],
    reloadHeader: () => void
}

export default function Story(props: StoryProps) {

    const { userDetails: { name, profileImgUrl, hasStory, userId }, currentUserId } = props
    const storyService = useService(StoryService)
    const dispatch = useAppDispatch()

    const [showPopup, setShowPopup] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [ringClass, setRingClass] = useState<string>()
    const [dates, setDates] = useState<Date[]>([])
    const [storyIds, setStoryIds] = useState<string[]>([])

    const [isViewed, setIsViewed] = useState<boolean>(props.viewedIds.includes(userId))
    const trueUser = userId === currentUserId ? true : false

    // Check if this story's `userId` has been seen
    const fetchData = async () => {
        try {
            const result = await storyService.getViewedStoryIds();
            const didTheUserSaw = result.find(view =>
                view.userIdUploaded === userId && view.userIdSaw === currentUserId)
            setIsViewed(didTheUserSaw ? true : false)
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchData();
        setRingClass(hasStory
            ? isViewed ? 'story-ring-viewed' : 'story-ring'
            : 'no-ring');
    }, [hasStory, isViewed]);

    async function handleViewStory() {
        try {
            const stories = await storyService.getUserStories(userId)
            const imageUrls = stories.map(story =>
                `${import.meta.env.VITE_AWS_SERVER_URL}/${userId}/${story.storyImgUrl}`
            )
            setImages(imageUrls)
            const storyIds = stories.map(story => story.id).filter((id): id is string => !!id);
            setStoryIds(storyIds);
            const createdAtArray = stories.map(story => story.createdAt!)
            setDates(createdAtArray)
            setShowPopup(true)
            setIsViewed(true)
            setRingClass('story-ring-viewed')
        } catch (e) {
            alert(e)
        }
    }

    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleAddStory() {
        fileInputRef.current?.click(); // open file picker
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return;

        try {
            // Upload to LocalStack/S3
            const uploadedInfo = await storyService.addStory(userId, file, profileImgUrl, name);
            console.log('Uploaded URL:', uploadedInfo);

            //i want the app to pop an upload window, which will after going to localstack, will be the url
            dispatch(newStory({ ...props.userDetails, storyImgUrl: uploadedInfo.storyImgUrl }))
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className='SingleStory'>
            <input
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <div className={ringClass}>
                <img src={profileImgUrl ? `${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}` : profilePicSource}
                    onClick={hasStory ? handleViewStory : handleAddStory}
                    className='profileImg'
                />
                {trueUser && <span className="add-icon"
                    onClick={handleAddStory}
                >+</span>}
            </div>
            <br />
            {name}

            {showPopup && (
                <StoryPopup
                    images={images}
                    onClose={() => setShowPopup(false)}
                    name={name}
                    profileImgUrl={profileImgUrl ? profileImgUrl : `il.co.yuvalrayer/profile.jpg`}
                    currentUserId={props.currentUserId}
                    userId={userId}
                    createdAt={dates}
                    storyIds={storyIds}
                    reloadHeader={props.reloadHeader}
                />
            )}
        </div>
    )
}
