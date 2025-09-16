import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GamesSlice {
    isGameOpen: boolean
}

const initialState: GamesSlice = {
    isGameOpen: false
}

export const gamesSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        setIsGameOpen: (state, action: PayloadAction<boolean>) => {
            state.isGameOpen = action.payload
        }
    }
})

export const { setIsGameOpen } = gamesSlice.actions

export default gamesSlice.reducer
