import { useEffect, useRef } from 'react'
import './Profile.css'
import Post from '../post/Post'
import NewPost from '../new/NewPost'
import Loading from '../../common/loading/Loading'
import useTitle from '../../../hooks/useTitle'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { init } from '../../../redux/profileSlice'
import useService from '../../../hooks/useService'
import ProfileService from '../../../services/auth-aware/Profile'
import useUserId from '../../../hooks/useUserId'

export default function Profile(): JSX.Element {

    useTitle('SN - Profile')

    const profileService = useService(ProfileService)

    const userId = useUserId()
    const postsState = useAppSelector(state => state.profile.posts)
    const dispatch = useAppDispatch()
    const postsNumRef = useRef(-1);

    useEffect(() => {
        (async () => {
            try {
                if (postsState.length === 0) {
                    const postsFromServer = await profileService.getProfile(userId)
                    dispatch(init(postsFromServer?.posts ?? []))
                    postsNumRef.current = postsFromServer?.postsNum ?? 0;
                }
            } catch (e) {
                alert(e)
            }
        })()
    }, [userId])

    return (
        <div className='Profile'>

            {postsState.length === 0 && postsNumRef.current === 0 && <>
                <NewPost />
                <br />
                <h4>You haven`t posted anything yet.
                    Be welcome to post your first post!</h4>
            </>}

            {postsState.length === 0 && postsNumRef.current === -1 && <Loading />}

            {postsState.length > 0 && <>
                {postsState.map(p =>
                    <Post
                        key={p.id}
                        post={p}
                        isAllowActions={true}
                    />
                )}
            </>}

        </div>
    )
}