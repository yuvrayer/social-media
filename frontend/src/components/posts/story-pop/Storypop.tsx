import StoryService from "../../../services/auth-aware/Story"
import { useEffect, useState, useRef } from 'react';
import './Storypop.css';
import useService from "../../../hooks/useService";

interface StoryPopupProps {
    images: string[];
    onClose: () => void;
    name: string;
    profileImgUrl: string,
    currentUserId: string,
    userId: string,
    createdAt: Date[],
    storyIds: string[],
    reloadHeader: () => void
}

export default function StoryPopup({ images, onClose, name, profileImgUrl, userId, currentUserId, createdAt, storyIds, reloadHeader }: StoryPopupProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const storyService = useService(StoryService)

    const markStoryViewed = async () => {
        try {
            await storyService.markStoryAsViewed(userId, currentUserId);
        } catch (e) {
            console.error("Failed to mark story as viewed:", e);
        }
    };

    useEffect(() => {
        markStoryViewed()
        startTimer();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentIndex]);

    const startTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onClose(); // close when all stories are shown
            }
        }, 8000); // 8 seconds per story
    };

    const goToNext = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else if (diffHours < 24) {
            return `${diffHours} h ago`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        }
    };

    async function deleteStory(): Promise<void> {
        try {
            await storyService.deleteStory(currentUserId, storyIds[currentIndex])
            reloadHeader()
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className="StoryPopup">
            <div className="StoryPopup-Overlay" onClick={onClose} />
            <div className="StoryPopup-Content">
                <div className="StoryPopup-Header">
                    <div className="StoryPopup-User">
                        <div className="StoryPopup-AvatarWrapper">
                            <img
                                src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`}
                                alt={name}
                                className="StoryPopup-Avatar"
                            />
                        </div>
                        <span className="StoryPopup-Username">{name}</span>
                        <span className="StoryPopup-Timestamp">
                            {formatRelativeTime(createdAt[currentIndex])}
                        </span>
                    </div>
                    {currentUserId === userId && <button onClick={deleteStory}>delete story</button>}
                    <button className="StoryPopup-Close" onClick={onClose}>✕</button>
                </div>

                <div className="StoryPopup-ProgressBar">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`ProgressSegment ${idx < currentIndex ? 'filled' : ''} ${idx === currentIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <img src={images[currentIndex]} className="StoryPopup-Image" alt={`Story ${currentIndex}`} />

                <div className="StoryPopup-Nav Left" onClick={goToPrev} />
                <div className="StoryPopup-Nav Right" onClick={goToNext} />
            </div>
        </div>
    );
}