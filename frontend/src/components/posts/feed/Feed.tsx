import { useEffect, useRef } from 'react'
import './Feed.css'
import Post from '../post/Post'
import useTitle from '../../../hooks/useTitle'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { init, setNewContent } from '../../../redux/feedSlice'
import Loading from '../../common/loading/Loading'
import useService from '../../../hooks/useService'
import FeedService from '../../../services/auth-aware/Feed'
import useUserId from '../../../hooks/useUserId'

export default function Feed() {
    useTitle('SN - Feed')
    const userId = useUserId()
    const postsNumRef = useRef(-1);

    const postsState = useAppSelector(state => state.feed.posts)
    const dispatch = useAppDispatch()

    const feedService = useService(FeedService)

    useEffect(() => {
        (async () => {
            try {
                const postsFromServer = await feedService.getFeed(userId)
                dispatch(init(postsFromServer.posts))
                postsNumRef.current = postsFromServer?.postsNum ?? 0;
            } catch (e) {
                alert(e)
            }
        })()
    }, [userId])

    async function reload() {
        try {
            const postsFromServer = await feedService.getFeed(userId)
            dispatch(init(postsFromServer.posts))
            postsNumRef.current = postsFromServer?.postsNum ?? 0;
        } catch (e) {
            alert(e)
        }
    }

    function dismiss() {
        dispatch(setNewContent(false))
    }

    const isNewContent = useAppSelector(state => state.feed.isNewContent)

    return (
        <div className='Feed'>

            {postsState.length === 0 && postsNumRef.current === 0 && <>
                <br />
                <h4>Your friends don`t have posts...</h4>
            </>}

            {postsState.length === 0 && postsNumRef.current === -1 && <Loading />}

            {postsState.length > 0 && <>

                {isNewContent && <>
                    <div className="info">
                        You have updates in your feed. reload? <button onClick={reload}>yes</button><button onClick={dismiss}>no</button>
                    </div>
                </>}

                {postsState.map(p => <Post
                    key={p.id}
                    post={p}
                />)}
            </>}
        </div>
    )
}