import './Search.css'
import { useEffect, useState } from "react"
import useService from "../../../hooks/useService"
import Loading from "../../common/loading/Loading"
import Follow from "../../follows/follow/Follow"
import FollowingService from '../../../services/auth-aware/Following'
import { useAppSelector } from '../../../redux/hooks'
import useUserId from '../../../hooks/useUserId'
import UserFillData from '../../../models/user/UserFillData'

const USERS_PER_PAGE = 3;

export default function Search(): JSX.Element {
    const [users, setUsers] = useState<UserFillData[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [searchTerm, setSearchTerm] = useState('');

    const following = useAppSelector(state => state.following.following);
    const userId = useUserId();
    const followersService = useService(FollowingService);

    useEffect(() => {
        followersService.getAllUsers()
            .then(setUsers)
            .catch(alert);
    }, []);

    const handlePageChange = (newPage: number, dir: 'left' | 'right') => {
        if (newPage < 0 || newPage >= totalPages) return;
        setDirection(dir);
        setCurrentPage(newPage);
    };

    // Filter and paginate users
    const filteredUsers = users.filter(
        user =>
            user.id !== userId &&
            !following.some(f => f.id === user.id) &&
            user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const startIndex = currentPage * USERS_PER_PAGE;
    const currentUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

    // Reset to page 0 when search term changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm]);

    return (
        <div className='Search'>
            <h2>Welcome to the searching people page...</h2>

            {filteredUsers.length !== 0 && <input
                type='text'
                placeholder='Search users...'
                className='SearchInput'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />}

            {users.length === 0 && <Loading />}{/* fetching data */}

            {filteredUsers.length === 0 && <>You follow all the users. Impressive!</>}

            {filteredUsers.length > 0 && (
                <>
                    <h3>People you may know:</h3>

                    <div className='PaginationControls'>
                        <button onClick={() => handlePageChange(currentPage - 1, 'left')} disabled={currentPage === 0}>←</button>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1, 'right')} disabled={currentPage === totalPages - 1}>→</button>
                    </div>

                    <div className={`FollowingPeopleSearch slide-${direction}`}>
                        {currentUsers.map(user => (
                            <Follow key={user.id} userId={user.id} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}