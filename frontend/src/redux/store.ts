import { configureStore } from "@reduxjs/toolkit";
import { followingSlice } from "./followingSlice";
import { profileSlice } from "./profileSlice";
import { feedSlice } from "./feedSlice";
import { storySlice } from "./storySlice";
import { followersSlice } from "./followers";
import { followingRequestSlice } from "./followingRequestSlice";
import { likesSlice } from "./likes";
import { chatSlice } from "./chatSlice";
import { gamesSlice } from "./games";

const store = configureStore({
    reducer: { // i.e. slices
        following: followingSlice.reducer, // i.e a single slice
        profile: profileSlice.reducer,
        feed: feedSlice.reducer,
        story: storySlice.reducer,
        followers: followersSlice.reducer,
        followingRequests: followingRequestSlice.reducer,
        likes: likesSlice.reducer,
        chat: chatSlice.reducer,
        games: gamesSlice.reducer
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch