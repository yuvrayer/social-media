import StoryService from "../../../services/auth-aware/Story"
import { useEffect, useState, useRef } from 'react';
import './Storypop.css';
import useService from "../../../hooks/useService";
import ProgressBar from "../progressBar/ProgressBar";
import StoryMessageInput from "../storyMessageInput/StoryMessageInput";
import useUserId from "../../../hooks/useUserId";

interface StoryPopupProps {
    images: string[];
    onClose: () => void;
    name: string;
    profileImgUrl: string,
    archiveStory: boolean,
    userId: string,
    createdAt: Date[],
    storyIds: string[],
    reloadHeader: () => void
}

export default function StoryPopup({ images, onClose, name, profileImgUrl, userId, createdAt, archiveStory, storyIds, reloadHeader }: StoryPopupProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentUserId = useUserId()
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

    const startTimeRef = useRef<number | null>(null);

    const startTimer = (timeInMs?: number) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        startTimeRef.current = Date.now(); // record start time

        timeoutRef.current = setTimeout(() => {
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onClose(); // close when all stories are shown
            }
        }, timeInMs ? timeInMs + 3000 : 8000); // 8 seconds per story
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

    //
    const getElapsedTime = () => {
        if (!startTimeRef.current) return 0;
        return Date.now() - startTimeRef.current; // ms elapsed
    };

    const getRemainingTime = () => {
        const duration = 8000; // your timer duration in ms
        return Math.max(duration - getElapsedTime(), 0);
    };


    const [progressBarStop, setProgressBarStop] = useState<boolean>(false);
    const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        const timeForTimer = getRemainingTime();

        if (value.trim() === '') {
            // Input is empty: resume progress bar immediately
            setProgressBarStop(false);

            // Clear any existing pause timeout
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
                pauseTimeoutRef.current = null;
            }
        } else {
            // Input has text: pause progress bar
            setProgressBarStop(true);

            // Clear any previous timeout before starting a new one
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
            }

            // Start or reset 3-second timer to resume progress bar
            pauseTimeoutRef.current = setTimeout(() => {
                setProgressBarStop(false);
                pauseTimeoutRef.current = null; // clear ref after timeout
            }, 3000);

            // If you want to restart the main timer with remaining time
            startTimer(timeForTimer);
        }
    }

    const notMyStory = currentUserId !== userId

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
                    {!archiveStory && currentUserId === userId &&
                        <button className="StoryPopup-DeleteButton" onClick={deleteStory}>delete story</button>
                    }
                    <button className="StoryPopup-Close" onClick={onClose}>✕</button>
                </div>

                <ProgressBar
                    total={images.length}
                    currentIndex={currentIndex}
                    durationMs={8000} // match timer duration in StoryPopup
                    autoPause={progressBarStop}
                />

                <img src={images[currentIndex]} className="StoryPopup-Image" alt={`Story ${currentIndex}`} />

                {notMyStory && <StoryMessageInput
                    onInputChange={onInputChange}
                    userId={userId}
                    imgSrc={images[currentIndex]}
                />}

                <div className="StoryPopup-Nav Left" onClick={goToPrev} />
                <div className="StoryPopup-Nav Right" onClick={goToNext} />
            </div>
        </div>
    );
}