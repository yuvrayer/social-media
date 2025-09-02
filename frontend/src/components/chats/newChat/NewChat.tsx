import { ChangeEvent, useEffect, useState } from 'react';
import './NewChat.css';
import { useForm } from 'react-hook-form';
import UserFillData from '../../../models/user/UserFillData';
import useUserId from '../../../hooks/useUserId';
import useService from '../../../hooks/useService';
import ChatService from '../../../services/auth-aware/Chat';
import FollowersService from '../../../services/auth-aware/Followers';
import FollowingService from '../../../services/auth-aware/Following';
import { Chat } from '../../../models/chat/Chat';
import profilePic from "../../../assets/images/profile.jpg"

interface NewChatComponentProps {
    onClose: () => void;
    onChatCreated: (newChat: Chat) => void;
}

export default function NewChatComponent({ onClose, onChatCreated }: NewChatComponentProps) {
    const [contacts, setContacts] = useState<UserFillData[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserFillData[]>([]);
    const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const USERS_PER_PAGE = 6;

    const userId = useUserId();
    const chatsService = useService(ChatService);
    const followersService = useService(FollowersService);
    const followingService = useService(FollowingService);

    const { register, handleSubmit, reset } = useForm<{ name?: string }>();

    useEffect(() => {
        (async () => {
            try {
                const followers = (await followersService.getFollowers()).users;
                const followings = (await followingService.getFollowing()).users;

                const combined = [...followers, ...followings].reduce((unique, user) => {
                    if (!unique.some(u => u.id === user.id)) unique.push(user);
                    return unique;
                }, [] as typeof followers);

                setContacts(combined.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (err) {
                console.error("Failed fetching contacts:", err);
            }
        })();
    }, []);

    const toggleUserSelect = (user: UserFillData) => {
        setSelectedUsers(prev =>
            prev.some(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        );
    };

    const handleGroupPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setPhotoFile(file);
        setPreviewImageSrc(file ? URL.createObjectURL(file) : null);
    };

    const onSubmit = async (data: { name?: string }) => {
        const isGroup = selectedUsers.length > 1;

        if (selectedUsers.length === 0) {
            alert("Please select at least one user.");
            return;
        }

        if (isGroup && !data.name?.trim()) {
            alert("Group name is required for group chats.");
            return;
        }

        const participantIds = selectedUsers.map(u => u.id).concat(userId);

        try {
            const formData = new FormData();
            formData.append('isGroup', String(isGroup));
            if (isGroup) formData.append('name', data.name!.trim());
            participantIds.forEach(id => formData.append('participantIds', id));
            if (photoFile) formData.append('photoFile', photoFile);

            const newChat = await chatsService.createChat(formData);
            onChatCreated(newChat);

            reset();
            setSelectedUsers([]);
            setPreviewImageSrc(null);
            setPhotoFile(null);
        } catch (err) {
            alert("Error creating chat: " + err);
        }
    };

    const filteredContacts = contacts.filter(user =>
        user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredContacts.length / USERS_PER_PAGE);

    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Start a New Chat</h3>

                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                <div className="user-list">
                    {paginatedContacts.map(user => {
                        const isSelected = selectedUsers.some(u => u.id === user.id);
                        return (
                            <div
                                key={user.id}
                                className={`user-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleUserSelect(user)}
                            >
                                <img src={user.profileImgUrl ? user.profileImgUrl : profilePic} alt={user.name} />
                                <span>{user.name}</span>
                                {isSelected && <span className="checkmark">✔</span>}
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ◀ Prev
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next ▶
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    {selectedUsers.length > 1 && (
                        <>
                            <h3>
                                Group Name:
                                <br />
                                <input
                                    {...register('name')}
                                    placeholder="Enter group chat name"
                                />
                            </h3>
                            <h3>
                                Group Photo:
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleGroupPhotoChange}
                                />
                            </h3>
                            {previewImageSrc && (
                                <div className="preview-image">
                                    <img src={previewImageSrc} alt="Preview" />
                                </div>
                            )}
                        </>
                    )}

                    <div className="modal-actions">
                        <button type="submit">Create Chat</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
