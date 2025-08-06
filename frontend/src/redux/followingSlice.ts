import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserFillData from "../models/user/UserFillData";

interface FollowingState {
    following: UserFillData[]
}

const initialState: FollowingState = {
    following: []
}

export const followingSlice = createSlice({
    name: 'following',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<UserFillData[]>) => {
            state.following = action.payload                        
        },
        unfollow: (state, action: PayloadAction<{userId: string}>) => {
            state.following = state.following.filter(f => f.id !== action.payload.userId)
        },
        follow: (state, action: PayloadAction<UserFillData>) => {
            state.following.push(action.payload)
        }
    }
})

export const { init, unfollow, follow } = followingSlice.actions

export default followingSlice.reducer
