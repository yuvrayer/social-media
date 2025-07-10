import './Search.css'
import { useEffect, useState } from "react"
import useService from "../../../hooks/useService"
import Loading from "../../common/loading/Loading"
import Follow from "../../follows/follow/Follow"
import FollowingService from '../../../services/auth-aware/Following'
import User from "../../../models/user/User"
import { useAppSelector } from '../../../redux/hooks'


export default function Search(): JSX.Element {
    const [users, setUsers] = useState<User[]>([])
    const following = useAppSelector(state => state.following.following)

    const followersService = useService(FollowingService)

    useEffect(() => {
        try {
            followersService.getAllUsers()
                .then(setUsers)
                .catch(alert)
        } catch (e) {
            alert(e)
        }
    }, [])



    return (
        <div className='Search'>
            welcome to the searching people page...
            {users.length === 0 && <Loading />}
            {users.length > 0 && <>
                <h3>People you may know:</h3>
                <div className='FollowingPeople'>
                    {users.filter(user => !following.some(f => f.id === user.id))
                        .map(follow => <Follow
                            key={follow.id}
                            user={follow}
                        ></Follow>)}
                </div>
            </>}
        </div>
    )
}