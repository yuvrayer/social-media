import 'bootstrap-icons/font/bootstrap-icons.css'
import './Post.css'
import PostModel from '../../../models/post/Post'
import ProfileService from '../../../services/auth-aware/Profile'
import { useNavigate } from 'react-router-dom'
import Comments from '../comments/Comments'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { remove } from '../../../redux/profileSlice'
import useService from '../../../hooks/useService'
import useUserId from '../../../hooks/useUserId'
import LikesService from '../../../services/auth-aware/Likes'
import { newPostLike, removePostLike } from '../../../redux/likes'

interface PostProps {
    post: PostModel,
    isAllowActions?: boolean, // === isAllowActions: boolean | undefined
}
export default function Post(props: PostProps): JSX.Element {

    const {
        title,
        body,
        createdAt,
        id,
        comments,
        imageUrl
    } = props.post
    const { username } = props.post.user


    const navigate = useNavigate()

    const userId = useUserId()

    const postsLikesState = useAppSelector(state => state.likes.postsLikes)
    const likesNum = postsLikesState.filter(p => p.postId === id).length
    const DoILike = postsLikesState.some(p => p.postId === id && p.userId === userId)

    const dispatch = useAppDispatch()

    const profileService = useService(ProfileService)
    const likesService = useService(LikesService)

    async function deleteMe() {
        if (confirm(`are you sure you want to delete "${title}"`)) {
            try {
                await profileService.remove(id)
                dispatch(remove({ id }))
            } catch (e) {
                alert(e)
            }
        }
    }

    function editMe() {
        navigate(`/edit/${id}`)
    }

    async function addLike() {
        try {
            const addedLike = await likesService.addPostLike(id)
            dispatch(newPostLike(addedLike))
        } catch (e) {
            alert(e)
        }
    }

    async function removeLike() {
        try {
            await likesService.removePostLike(id)
            dispatch(removePostLike({ userId, postId: id }))
        } catch (e) {
            alert(e)
        }
    }

    const bucket = "il.co.yuvalrayer"

    return (
        <div className='Post'>
            <div>
                {title}
            </div>
            <div>
                by {username} at {createdAt}
            </div>
            {imageUrl && <div>
                <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${bucket}/${imageUrl}`} />
            </div>}
            <div>
                {body}
            </div>
            {props.isAllowActions &&
                <div>
                    <div className='backgroundGray'>Has <span className='LikesNum'> {likesNum}</span> likes </div>
                    <button onClick={editMe}>Edit</button>
                    <button onClick={deleteMe}>Delete</button>
                </div>
            }
            {!props.isAllowActions &&
                <div className={`${DoILike ? 'Liked' : 'NotLiked'}`}>
                    <button className='Button' onClick={DoILike ? removeLike : addLike}>likes: {likesNum} <i className="bi bi-heart-fill" /> </button>
                </div>
            }

            <Comments
                comments={comments}
                postId={id}
            />
        </div >
    )
}
