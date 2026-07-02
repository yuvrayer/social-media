import './Story.css'
import StoryService from "../../../services/auth-aware/Story"
import useService from '../../../hooks/useService'
import { newStory } from '../../../redux/storySlice'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { useRef, useState } from 'react'
import profilePicSource from '../../../assets/images/profile.jpg'
import StoryPopup from '../story-pop/Storypop'
import useName from '../../../hooks/useName'
import useUserId from '../../../hooks/useUserId'
import useProfileImg from '../../../hooks/useProfileImg'

interface StoryProps {
    reloadHeader: () => void
}

export default function Story(props: StoryProps) {
    const name = useName()
    const userId = useUserId()
    const profileImgUrl = useProfileImg()

    const hasStory = useAppSelector(state => state.story.whoHasStory)
        .some(story => story.userId === userId);


    const storyService = useService(StoryService)
    const dispatch = useAppDispatch()

    const [showPopup, setShowPopup] = useState(false)
    const [images, setImages] = useState<string[]>([])
    const [dates, setDates] = useState<Date[]>([])
    const [storyIds, setStoryIds] = useState<string[]>([])

    // Check if this story's `userId` has been seen
    const stories = useAppSelector(state => state.story.whoHasStory);
    const viewedStories = useAppSelector(state => state.story.storeysISaw);

    const userStories = stories.filter(s => s.userId === userId);

    const userViewedStories = viewedStories.filter(
        v =>
            v.userIdSaw === userId &&
            v.userIdUploaded === userId &&
            !!v.storyId
    );

    const hasUnseenStory = userStories.some(
        story =>
            !!story.id &&
            !userViewedStories.some(v => v.storyId === story.id)
    );

    async function handleViewStory() {
        try {
            const stories = await storyService.getUserStories(userId)
            const imageUrls = stories.map(story =>
                `${import.meta.env.VITE_AWS_SERVER_URL}/${userId}/${story.storyImgUrl}`
            )
            setImages(imageUrls)
            const storyIds = stories.map(story => story.id).filter((id): id is string => !!id);
            setStoryIds(storyIds);
            const createdAtArray = stories.map(story => story.createdAt)
            setDates(createdAtArray)
            setShowPopup(true)
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
            dispatch(newStory(uploadedInfo))
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
            <div className={hasStory
                ? hasUnseenStory
                    ? 'story-ring'
                    : 'story-ring-viewed'
                : 'no-ring'}>
                <img src={profileImgUrl ? `${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}` : profilePicSource}
                    onClick={hasStory ? handleViewStory : handleAddStory}
                    className='profileImg'
                />
                {<span className="add-icon"
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
                    profileImgUrl={profileImgUrl ?? `il.co.yuvalrayer/profile.jpg`}
                    archiveStory={false}
                    userId={userId}
                    createdAt={dates}
                    storyIds={storyIds}
                    reloadHeader={props.reloadHeader}
                />
            )}
        </div>
    )
}
