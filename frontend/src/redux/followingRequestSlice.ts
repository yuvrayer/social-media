import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import UserFillData from "../models/user/UserFillData";

interface FollowingRequestState {
    followingRequestISent: string[], //all the requests i sent
    followingRequestIReceived: UserFillData[], //all the requests i received (with the data to display name, img)
    newFollowRequest: boolean //for new follower flag
}

const initialState: FollowingRequestState = {
    followingRequestISent: [],
    followingRequestIReceived: [],
    newFollowRequest: false
}

export const followingRequestSlice = createSlice({
    name: 'followingRequest',
    initialState,
    reducers: {
        initISent: (state, action: PayloadAction<string[]>) => {
            state.followingRequestISent = action.payload
        },
        initIReceived: (state, action: PayloadAction<UserFillData[]>) => {
            state.followingRequestIReceived = action.payload
        },
        addFollowRequestFromSliceIReceived: (state, action: PayloadAction<UserFillData>) => {
            state.followingRequestIReceived.push(action.payload)
        },
        deleteFollowRequestFromSliceIReceived: (state, action: PayloadAction<({ userId: string })>) => {
            state.followingRequestIReceived = state.followingRequestIReceived.filter(user => user.id !== action.payload.userId)
        },
        deleteFollowRequestFromSliceISent: (state, action: PayloadAction<{ userId: string }>) => {
            state.followingRequestISent = state.followingRequestISent.filter(userId => userId !== action.payload.userId)
        },
        followRequestUpdateSliceISent: (state, action: PayloadAction<string>) => {
            state.followingRequestISent.push(action.payload)
        },
        newFollowerAlert: (state, action: PayloadAction<boolean>) => {
            state.newFollowRequest = action.payload
        }
    }
})

export const { initISent,
    newFollowerAlert,
    addFollowRequestFromSliceIReceived,
    initIReceived,
    deleteFollowRequestFromSliceIReceived,
    deleteFollowRequestFromSliceISent,
    followRequestUpdateSliceISent
} = followingRequestSlice.actions

export default followingRequestSlice.reducer
