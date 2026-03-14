import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GamesResponse } from "../models/games/Games";

interface GamesSlice {
    isGameOpen: boolean,
    scores: GamesResponse[]
}

const initialState: GamesSlice = {
    isGameOpen: false,
    scores: []
}

export const gamesSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        setIsGameOpen: (state, action: PayloadAction<boolean>) => {
            state.isGameOpen = action.payload
        },
        setScores: (state, action: PayloadAction<GamesResponse[]>) => {
            state.scores = action.payload
        }
    }
})

export const { setIsGameOpen, setScores } = gamesSlice.actions

export default gamesSlice.reducer
