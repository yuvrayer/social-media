import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Story from "../models/story/Story";

interface StoryState {
    whoHasStory: Story[]
}

const initialState: StoryState = {
    whoHasStory: []
}

export const storySlice = createSlice({
    name: 'story',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<Story[]>) => {
            state.whoHasStory = action.payload
        },
        newStory: (state, action: PayloadAction<Story>) => {
            state.whoHasStory = [action.payload, ...state.whoHasStory]
        },
        remove: (state, action: PayloadAction<{ id: string }>) => {
            state.whoHasStory = state.whoHasStory.filter(p => p.userId !== action.payload.id)
        }
    }
})

export const { init, remove, newStory } = storySlice.actions

export default storySlice.reducer
