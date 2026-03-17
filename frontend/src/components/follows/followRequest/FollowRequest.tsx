import './FollowRequest.css'
import { useState } from "react"
import Loading from "../../common/loading/Loading"
import Follow from "../follow/Follow"
import { useAppSelector } from '../../../redux/hooks'

const USERS_PER_PAGE = 10;

export default function FollowRequest(): JSX.Element {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    const usersNum = useAppSelector(state => state.followingRequests.followingRequestIReceived).length
    const followingRequestsIReceived = useAppSelector(state => state.followingRequests.followingRequestIReceived);

    const handlePageChange = (newPage: number, dir: 'left' | 'right') => {
        if (newPage < 0 || newPage >= totalPages) return;
        setDirection(dir);
        setCurrentPage(newPage);
    };

    const totalPages = Math.ceil(usersNum / USERS_PER_PAGE);
    const paginatedUsers = followingRequestsIReceived.slice(
        currentPage * USERS_PER_PAGE,
        (currentPage + 1) * USERS_PER_PAGE
    )

    return (
        <div className='Search'>
            <h2>Welcome to the page for following requests...</h2>

            {usersNum === -1 && <Loading />}{/* fetching data */}

            {usersNum === 0 && <>You don`t have following requests.</>}

            {usersNum > 0 && (
                <>
                    <h3>People want to follow you:</h3>

                    <div className='PaginationControls'>
                        <button onClick={() => handlePageChange(currentPage - 1, 'left')} disabled={currentPage === 0}>←</button>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1, 'right')} disabled={currentPage === totalPages - 1}>→</button>
                    </div>

                    <div className={`FollowingPeopleSearch slide-${direction}`}>
                        {paginatedUsers.map(user => (
                            <Follow key={user.id} userId={user.id} request={true}
                                otherUserFillData={
                                    {
                                        name: user.name,
                                        profileImgUrl: user.profileImgUrl,
                                        id: user.id
                                    }
                                }
                                stopFollowIndex={false}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}