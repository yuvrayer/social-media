import './StoryHistory.css'
import StoryService from "../../../services/auth-aware/Story"
import useService from '../../../hooks/useService'
import { useEffect, useState } from 'react'
import StoryPopup from '../story-pop/Storypop'
import StoryResponse from '../../../models/story/StoryResponse'
import useUserId from '../../../hooks/useUserId'

export default function StoryHistory() {
    const currentUserId = useUserId()
    const storyService = useService(StoryService)
    const [userStoryHistory, setUserStoryHistory] = useState<StoryResponse[]>([])
    const [showPopup, setShowPopup] = useState(false)
    const [selectedStory, setSelectedStory] = useState<StoryResponse | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await storyService.getUserStoriesHistory()
                setUserStoryHistory(result)
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [])

    const handleStoryClick = (story: StoryResponse) => {
        setSelectedStory(story)
        setShowPopup(true)
    }

    return (
        <div className='HistoryStory'>
            {userStoryHistory.map(story => (
                <div
                    key={story.id}
                    className="story-thumbnail"
                    onClick={() => handleStoryClick(story)}
                >
                    <div className="story-date">
                        {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : ''}
                    </div>
                    <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${currentUserId}/${story.storyImgUrl}`} />
                </div>
            ))}

            {!userStoryHistory && <>you don`t have story history yet...</>}

            {showPopup && selectedStory && (
                <StoryPopup
                    images={[`${import.meta.env.VITE_AWS_SERVER_URL}/${currentUserId}/${selectedStory.storyImgUrl}`]}
                    onClose={() => setShowPopup(false)}
                    name={selectedStory.name}
                    profileImgUrl={selectedStory.profileImgUrl || 'il.co.yuvalrayer/profile.jpg'}
                    archiveStory={true}
                    userId={selectedStory.userId}
                    createdAt={selectedStory.createdAt ? [selectedStory.createdAt] : []}
                    storyIds={[selectedStory.id || '']}
                    reloadHeader={() => { }}
                />
            )}
        </div>
    )
}
