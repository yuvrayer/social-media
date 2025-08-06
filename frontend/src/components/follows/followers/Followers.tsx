import { useEffect, useRef } from 'react'
import './Followers.css'
import Follow from '../follow/Follow'
import useService from '../../../hooks/useService'
import FollowersService from '../../../services/auth-aware/Followers'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { init } from '../../../redux/followers'
import Loading from '../../common/loading/Loading'

export default function Followers() {
    const followersState = useAppSelector(state => state.followers.followers)
    const dispatch = useAppDispatch()

    const followersService = useService(FollowersService)
    const followersNumRef = useRef(-1)

    useEffect(() => {
        (async () => {
            try {
                if (followersState.length === 0) {
                    const followers = await followersService.getFollowers()
                    dispatch(init(followers?.users ?? []))
                    followersNumRef.current = followers?.usersNum ?? 0
                }
            } catch (e) {
                alert(e)
            }
        })()

    }, [])

    return (
        <div className='Followers'>

            {followersState.length === 0 && followersNumRef.current === 0 && <>
                <h3>People who follow me:</h3>
                <h4>You don`t have anyone that follow you</h4>
            </>}

            {followersState.length === 0 && followersNumRef.current === -1 && <Loading />}

            {followersState.length > 0 && <>
                <h3>People who follow me:</h3>
                <div className='FollowingPeople'>
                    {followersState.map(follow => <Follow
                        key={follow.id}
                        userId={follow.id}
                    ></Follow>)}
                </div>
            </>}

        </div>
    )
}