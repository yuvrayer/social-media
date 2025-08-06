import { configureStore } from "@reduxjs/toolkit";
import { followingSlice } from "./followingSlice";
import { profileSlice } from "./profileSlice";
import { feedSlice } from "./feedSlice";
import { storySlice } from "./storySlice";
import { followersSlice } from "./followers";
import { followingRequestSlice } from "./followingRequestSlice";

const store = configureStore({
    reducer: { // i.e. slices
        following: followingSlice.reducer, // i.e a single slice
        profile: profileSlice.reducer,
        feed: feedSlice.reducer,
        story: storySlice.reducer,
        followers: followersSlice.reducer,
        followingRequests: followingRequestSlice.reducer
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch