import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FollowingRequestState {
    followingRequestISent: string[],
    followingRequestIReceived: string[]
}

const initialState: FollowingRequestState = {
    followingRequestISent: [],
    followingRequestIReceived: []
}

export const followingRequestSlice = createSlice({
    name: 'followingRequest',
    initialState,
    reducers: {
        initISent: (state, action: PayloadAction<string[]>) => {
            state.followingRequestISent = action.payload
        },
        initIReceived: (state, action: PayloadAction<string[]>) => {
            state.followingRequestIReceived = action.payload
        },
        deleteFollowRequestFromSliceIReceived: (state, action: PayloadAction<({ userId: string })>) => {
            state.followingRequestIReceived = state.followingRequestIReceived.filter(userId => userId !== action.payload.userId)
        },
        deleteFollowRequestFromSliceISent: (state, action: PayloadAction<{ userId: string }>) => {
            state.followingRequestISent = state.followingRequestISent.filter(userId => userId !== action.payload.userId)
        },
        followRequestUpdateSliceISent: (state, action: PayloadAction<string>) => {
            state.followingRequestISent.push(action.payload)
        }
    }
})

export const { initISent, initIReceived, deleteFollowRequestFromSliceIReceived , deleteFollowRequestFromSliceISent, followRequestUpdateSliceISent } = followingRequestSlice.actions

export default followingRequestSlice.reducer
