import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import PostLikes from "../models/post/PostLikes";
import CommentLikes from "../models/comment/CommentLikes";

interface LikesSlice {
    postsLikes: PostLikes[],
    commentLikes: CommentLikes[]
}

const initialState: LikesSlice = {
    postsLikes: [],
    commentLikes: []
}

export const likesSlice = createSlice({
    name: 'likes',
    initialState,
    reducers: {
        initPostsLikes: (state, action: PayloadAction<PostLikes[]>) => {
            state.postsLikes = action.payload
        },
        initCommentLikes: (state, action: PayloadAction<CommentLikes[]>) => {
            state.commentLikes = action.payload
        },
        newPostLike: (state, action: PayloadAction<PostLikes>) => {
            state.postsLikes = [action.payload, ...state.postsLikes]
        },
        newCommentLike: (state, action: PayloadAction<CommentLikes>) => {
            state.commentLikes = [action.payload, ...state.commentLikes]
        },
        removePostLike: (state, action: PayloadAction<PostLikes>) => {
            state.postsLikes = state.postsLikes.filter(
                p => !(p.userId === action.payload.userId && p.postId === action.payload.postId)
            )
        },
        removeCommentLike: (state, action: PayloadAction<CommentLikes>) => {
            state.commentLikes = state.commentLikes.filter(
                p => !(p.userId === action.payload.userId && p.commentId === action.payload.commentId)
            )
        },
    }
})

export const { initPostsLikes, initCommentLikes, newPostLike, newCommentLike, removePostLike, removeCommentLike } = likesSlice.actions

export default likesSlice.reducer
