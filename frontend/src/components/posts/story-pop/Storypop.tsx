import { useEffect, useState, useRef } from 'react';
import './Storypop.css';

interface StoryPopupProps {
    images: string[];
    onClose: () => void;
    name: string
    profileImgUrl: string
}

export default function StoryPopup({ images, onClose, name, profileImgUrl }: StoryPopupProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
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
                    </div>
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