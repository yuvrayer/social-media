import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserFillData from "../models/user/UserFillData";

interface FollowersState {
    followers: UserFillData[],
}

const initialState: FollowersState = {
    followers: [],
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
        }
    }
})

export const { init, noLongerFollowUser, newFollower } = followersSlice.actions

export default followersSlice.reducer
