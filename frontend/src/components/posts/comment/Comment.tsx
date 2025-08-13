import useService from '../../../hooks/useService'
import useUserId from '../../../hooks/useUserId'
import CommentModel from '../../../models/comment/Comment'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import './Comment.css'
import LikesService from '../../../services/auth-aware/Likes'
import { newCommentLike, removeCommentLike } from '../../../redux/likes'

interface CommentProps {
    comment: CommentModel
}
export default function Comment(props: CommentProps): JSX.Element {

    const { user: { name }, body, createdAt, id } = props.comment

    const userId = useUserId()

    const commentsLikesState = useAppSelector(state => state.likes.commentLikes)
    const likesNum = commentsLikesState.filter(p => p.commentId === id).length
    const DoILike = commentsLikesState.some(p => p.commentId === id && p.userId === userId)

    const likesService = useService(LikesService)

    const dispatch = useAppDispatch()

    async function addLike() {
        try {
            const addedLike = await likesService.addCommentLike(id)
            dispatch(newCommentLike(addedLike))
        } catch (e) {
            alert(e)
        }
    }

    async function removeLike() {
        try {
            await likesService.removeCommentLike(id)
            dispatch(removeCommentLike({ userId, commentId: id }))
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className='Comment'>
            <div className={`${DoILike ? 'Liked' : 'NotLiked'}`}>
                <button className='Button' onClick={DoILike ? removeLike : addLike}>likes: {likesNum} <i className="bi bi-heart-fill" /> </button>
            </div>
            <div>
                {name} said on {createdAt}:
            </div>
            <div>
                {body}
            </div>
        </div>
    )
}

