import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserFillData from "../models/user/UserFillData";

interface FollowersState {
    followers: UserFillData[],
    pending: number
}

const initialState: FollowersState = {
    followers: [],
    pending: 0
}

export const followersSlice = createSlice({
    name: 'followers',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<UserFillData[]>) => {
            state.followers = action.payload
        },
        noLongerFollowUser: (state, action: PayloadAction<{ userId: string }>) => {
            state.followers = state.followers.filter(f => f.id !== action.payload.userId)
        },
        newFollower: (state, action: PayloadAction<UserFillData>) => {
            state.followers.push(action.payload)
        },
        newFollowerAlert: (state, action: PayloadAction<number>) => {
            state.pending = action.payload
        }
    }
})

export const { init, noLongerFollowUser, newFollower, newFollowerAlert } = followersSlice.actions

export default followersSlice.reducer
