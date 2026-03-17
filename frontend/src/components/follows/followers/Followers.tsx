import { useEffect, useState } from 'react'
import './Followers.css'
import Follow from '../follow/Follow'
import useService from '../../../hooks/useService'
import FollowersService from '../../../services/auth-aware/Followers'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { init } from '../../../redux/followers'
import Loading from '../../common/loading/Loading'

interface FollowersProps {
    startPopUp: () => void
}

export default function Followers(props: FollowersProps) {
    const followersState = useAppSelector(state => state.followers.followers)
    const dispatch = useAppDispatch()

    const followersService = useService(FollowersService)
    const [followersNum, setFollowersNum] = useState(-1)

    useEffect(() => {
        (async () => {
            try {
                if (followersState.length === 0) {
                    const followers = await followersService.getFollowers()
                    dispatch(init(followers?.users ?? []))
                    setFollowersNum(followers?.usersNum ?? 0)
                }
            } catch (e) {
                alert(e)
            }
        })()

    }, [])


    return (
        <div className='Followers'>

            {followersState.length === 0 && followersNum === 0 && <>
                <h3>People who follow me:</h3>
                <h4>You don`t have anyone that follow you</h4>
            </>}

            {followersState.length === 0 && followersNum === -1 && <Loading />}

            {followersState.length > 0 && <>
                <h3>People who follow me:</h3>
                <button onClick={() => props.startPopUp()}>
                    Show All Followers
                </button>

                <div className='FollowingPeople'>
                    {followersState.map(follow => <Follow
                        key={follow.id}
                        userId={follow.id}
                        otherUserFillData={{
                            name: follow.name,
                            profileImgUrl: follow.profileImgUrl,
                            id: follow.id,
                        }}
                        stopFollowIndex={false}
                    ></Follow>)}
                </div>
            </>}

        </div>
    )
}