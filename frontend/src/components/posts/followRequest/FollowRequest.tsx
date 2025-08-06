import './FollowRequest.css'
import { useEffect, useState } from "react"
import useService from "../../../hooks/useService"
import Loading from "../../common/loading/Loading"
import Follow from "../../follows/follow/Follow"
import FollowingRequestService from '../../../services/auth-aware/followRequest'
import { useAppSelector } from '../../../redux/hooks'
import { initIReceived } from '../../../redux/followingRequestSlice'
import { useDispatch } from 'react-redux'

const USERS_PER_PAGE = 10;

export default function FollowRequest(): JSX.Element {
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [usersNum, setUsersNum] = useState<number>(-1)

    const followingRequestsIReceived = useAppSelector(state => state.followingRequests.followingRequestIReceived);
    const followingRequestService = useService(FollowingRequestService);
    const dispatch = useDispatch();

    useEffect(() => {
        try {
            (async () => {
                const usersDataFromServer = await followingRequestService.getAllPendingRequestsIReceived()
                //users= users that sent a follow request for the current logged user
                const usersIdArray = usersDataFromServer.users.map(user => user.id)
                dispatch(initIReceived(usersIdArray))
                setUsersNum(usersDataFromServer.usersNum)
            })()
        } catch (e) {
            alert(e)
        }
    }, []);

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
            <h2>Welcome to the searching people page...</h2>

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
                            <Follow key={user} userId={user} request={true} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}