import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import StoryResponse from "../models/story/StoryResponse";
import SawStoryBy from "../models/story/SawStoryBy";

interface StoryState {
    whoHasStory: StoryResponse[] //all the stories
    storeysISaw: SawStoryBy[] //stories 
    newStoryAlert: boolean
}

const initialState: StoryState = {
    whoHasStory: [],
    storeysISaw: [],
    newStoryAlert: false
}

export const storySlice = createSlice({
    name: 'story',
    initialState,
    reducers: {
        init: (state, action: PayloadAction<StoryResponse[]>) => {
            state.whoHasStory = action.payload
        },
        initISaw: (state, action: PayloadAction<SawStoryBy[]>) => {
            state.storeysISaw = action.payload
        },
        addISaw: (state, action: PayloadAction<SawStoryBy>) => {
            state.storeysISaw = [action.payload, ...state.storeysISaw]
        },
        newStory: (state, action: PayloadAction<StoryResponse>) => {
            state.whoHasStory = [action.payload, ...state.whoHasStory]
        },
        removeStory: (state, action: PayloadAction<{ id: string }>) => {
            state.whoHasStory = state.whoHasStory.filter(p => p.id !== action.payload.id)
            state.storeysISaw = state.storeysISaw.filter(s => s.storyId !== action.payload.id)
        },
        newStoryAlert: (state, action: PayloadAction<boolean>) => {
            state.newStoryAlert = action.payload
        }
    }
})

export const { init, removeStory, newStory, initISaw, addISaw, newStoryAlert } = storySlice.actions

export default storySlice.reducer
