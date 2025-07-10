import './Story.css'
import StoryModel from "../../../models/story/Story"
import StoryService from "../../../services/auth-aware/Story"
import useService from '../../../hooks/useService'
import { newStory } from '../../../redux/storySlice'
import { useAppDispatch } from '../../../redux/hooks'
import { useRef, useState } from 'react'
import profilePicSource from '../../../assets/images/profile.jpg'
import StoryPopup from '../story-pop/Storypop'

interface StoryProps {
    userDetails: StoryModel
}

export default function Story(props: StoryProps) {

    const { userDetails: { name, profileImgUrl, hasStory, userId } } = props
    const storyService = useService(StoryService)
    const dispatch = useAppDispatch()

    const [showPopup, setShowPopup] = useState(false)
    const [images, setImages] = useState<string[]>([])

    async function handleViewStory() {
        try {
            const stories = await storyService.getUserStories(userId)
            const imageUrls = stories.map(story =>
                `${import.meta.env.VITE_AWS_SERVER_URL}/${userId}/${story.storyImgUrl}`
            )
            setImages(imageUrls)
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
            const uploadedUrl = await storyService.addStory(userId, file, profileImgUrl, name);
            console.log('Uploaded URL:', uploadedUrl);

            //i want the app to pop an upload window, which will after going to localstack, will be the url
            dispatch(newStory({ ...props.userDetails, storyImgUrl: uploadedUrl.storyImgUrl }))
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
            <div className={hasStory ? "story-ring" : "no-ring"}>
                <img src={profileImgUrl ? `${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}` : profilePicSource}
                    onClick={hasStory ? handleViewStory : handleAddStory}
                    className='profileImg'
                />
                {!hasStory && <span className="add-icon">+</span>}
            </div>
            <br />
            {name}

            {showPopup && (
                <StoryPopup
                    images={images}
                    onClose={() => setShowPopup(false)}
                    name={name}
                    profileImgUrl={profileImgUrl}
                />
            )}
        </div>
    )
}
