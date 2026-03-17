import './FollowingModal.css';
import Follow from '../follow/Follow';
import { useAppSelector } from '../../../redux/hooks';
import { useState } from 'react';

interface FollowingModalProps {
    onClose: () => void;
}

export default function FollowingModal({ onClose }: FollowingModalProps) {
    const followingState = useAppSelector(state => state.following.following);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter following based on search
    const filteredFollowing = followingState.filter(follow =>
        follow.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const followingNum = filteredFollowing.length;

    return (
        <div className="FollowingModalWrapper">
            {/* Overlay to block background */}
            <div className="FollowingModalOverlay" onClick={onClose} />

            {/* Modal content */}
            <div className="FollowingModalContent">
                <div className="FollowingModalHeader">
                    <h3>People who I follow:</h3>
                    <button className="FollowingModalClose" onClick={onClose}>✕</button>
                </div>

                {/* Search bar */}
                <div className="FollowingModalSearch">
                    <input
                        type="text"
                        placeholder="Search following..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="FollowingModalBody">
                    {followingNum === 0 ? (
                        <p>No following found</p>
                    ) : (
                        <div className="FollowingModalList">
                            {filteredFollowing.map(follow => (
                                <Follow
                                    key={follow.id}
                                    userId={follow.id}
                                    otherUserFillData={{
                                        name: follow.name,
                                        profileImgUrl: follow.profileImgUrl,
                                        id: follow.id,
                                    }}
                                    stopFollowIndex={false}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="FollowingModalFooter">
                    <button onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}