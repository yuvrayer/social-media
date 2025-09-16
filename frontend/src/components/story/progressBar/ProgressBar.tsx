// import React, { useEffect, useState } from 'react';
// import './ProgressBar.css';

// interface ProgressBarProps {
//     total: number;
//     currentIndex: number;
//     durationMs: number;
//     autoPause: boolean; // Pause for 3000ms if true
// }

// const ProgressBar: React.FC<ProgressBarProps> = ({
//     total,
//     currentIndex,
//     durationMs,
//     autoPause,
// }) => {
//     const [animationPlayState, setAnimationPlayState] = useState<'paused' | 'running'>('paused');

//     useEffect(() => {
//         setAnimationPlayState('paused'); // Pause animation immediately on story change

//         const pauseDuration = autoPause ? 3000 : 0;

//         const timer = setTimeout(() => {
//             setAnimationPlayState('running'); // Start animation after pauseDuration
//         }, pauseDuration);

//         return () => clearTimeout(timer);
//     }, [currentIndex, autoPause]);

//     return (
//         <div className="ProgressBar">
//             {Array.from({ length: total }).map((_, idx) => (
//                 <div
//                     key={idx}
//                     className={`ProgressSegment ${idx < currentIndex ? 'filled' : ''}`}
//                 >
//                     {idx === currentIndex && (
//                         <div
//                             className="ProgressFill"
//                             style={{
//                                 animationName: 'fill',
//                                 animationDuration: `${durationMs}ms`,
//                                 animationTimingFunction: 'linear',
//                                 animationFillMode: 'forwards',
//                                 animationPlayState: animationPlayState,
//                             }}
//                         />
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default ProgressBar;

import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
    total: number;
    currentIndex: number;
    durationMs: number;
    autoPause: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    total,
    currentIndex,
    durationMs,
    autoPause,
}) => {
    const [key, setKey] = useState(0); // used to reset animation on story change

    useEffect(() => {
        setKey(prev => prev + 1); // force re-render when currentIndex changes
    }, [currentIndex]);

    return (
        <div className="ProgressBar">
            {Array.from({ length: total }).map((_, idx) => (
                <div
                    key={idx}
                    className={`ProgressSegment ${idx < currentIndex ? 'filled' : ''}`}
                >
                    {idx === currentIndex && (
                        <div
                            key={key} // forces animation to restart on story change
                            className="ProgressFill"
                            style={{
                                animationName: 'fill',
                                animationDuration: `${durationMs}ms`,
                                animationTimingFunction: 'linear',
                                animationFillMode: 'forwards',
                                animationPlayState: autoPause ? 'paused' : 'running',
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProgressBar;
