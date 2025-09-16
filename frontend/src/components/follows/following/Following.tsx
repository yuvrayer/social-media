import './Following.css'
import { useEffect, useRef } from 'react'
import Follow from '../follow/Follow'
import Loading from '../../common/loading/Loading'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { init } from '../../../redux/followingSlice'
import useService from '../../../hooks/useService'
import FollowingService from '../../../services/auth-aware/Following'
import { setIsGameOpen } from '../../../redux/games'

export default function Following() {
    const followingState = useAppSelector(state => state.following.following)

    const dispatch = useAppDispatch()

    const followingService = useService(FollowingService)
    const followingNumRef = useRef(-1)

    useEffect(() => {
        (async () => {
            try {
                if (followingState.length === 0) {
                    const following = await followingService.getFollowing()
                    dispatch(init(following?.users ?? []))
                    followingNumRef.current = following?.usersNum ?? 0;
                }
            } catch (e) {
                alert(e)
            }
        })()
    }, [])


    const state = useAppSelector(state => state.games.isGameOpen)
    function toggleChange() {
        dispatch(setIsGameOpen(!state))
    }

    return (
        <div className='Following'>

            <i className="bi bi-arrow-left-circle" onClick={toggleChange}></i>

            {followingState.length === 0 && followingNumRef.current === 0 && <>
                <h3>People I follow:</h3>
                <h4>You aren`t following anyone.
                    Be welcome to follow anyone!</h4>
            </>}

            {followingState.length === 0 && followingNumRef.current === -1 && <Loading />}

            {followingState.length > 0 && <>
                <h3>People I follow:</h3>
                <div className='FollowingPeople'>
                    {followingState.map(follow => <Follow
                        key={follow.id}
                        userId={follow.id}
                        otherUserFillData={{
                            name: follow.name,
                            profileImgUrl: follow.profileImgUrl,
                            id: follow.id,
                        }}
                    ></Follow>)}
                </div>
            </>}
        </div >
    )
}