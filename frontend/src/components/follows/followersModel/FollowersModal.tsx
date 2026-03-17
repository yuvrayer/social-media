import './FollowersModal.css';
import Follow from '../follow/Follow';
import { useAppSelector } from '../../../redux/hooks';
import { useState } from 'react';

interface FollowersModalProps {
    onClose: () => void;
}

export default function FollowersModal({ onClose }: FollowersModalProps) {
    const followersState = useAppSelector(state => state.followers.followers);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter followers based on search
    const filteredFollowers = followersState.filter(follow =>
        follow.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const followersNum = filteredFollowers.length;

    return (
        <div className="FollowersModalWrapper">
            {/* Overlay to block background */}
            <div className="FollowersModalOverlay" onClick={onClose} />

            {/* Modal content */}
            <div className="FollowersModalContent">
                <div className="FollowersModalHeader">
                    <h3>People who follow me:</h3>
                    <button className="FollowersModalClose" onClick={onClose}>✕</button>
                </div>

                {/* Search bar */}
                <div className="FollowersModalSearch">
                    <input
                        type="text"
                        placeholder="Search followers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="FollowersModalBody">
                    {followersNum === 0 ? (
                        <p>No followers found</p>
                    ) : (
                        <div className="FollowersModalList">
                            {filteredFollowers.map(follow => (
                                <Follow
                                    key={follow.id}
                                    userId={follow.id}
                                    otherUserFillData={{
                                        name: follow.name,
                                        profileImgUrl: follow.profileImgUrl,
                                        id: follow.id,
                                    }}
                                    stopFollowIndex={true}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="FollowersModalFooter">
                    <button onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}