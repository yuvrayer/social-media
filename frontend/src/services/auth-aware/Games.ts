import { GamesResponse } from "../../models/games/Games";
import AuthAware from "./AuthAware";

export default class GamesRequest extends AuthAware {
    async getGamesBestScores(gameCode: string): Promise<GamesResponse[]> {
        const response = await this.axiosInstance.get<GamesResponse[]>(`${import.meta.env.VITE_REST_SERVER_URL}/games/getGamesBestScores/${gameCode}`)
        return response.data
    }

    async newGameBestScore(gameCode: string, newBestScore: number): Promise<void> {
        const response = await this.axiosInstance.post<void>(`${import.meta.env.VITE_REST_SERVER_URL}/games/newGameBestScore/${gameCode}`, { newBestScore })
        return response.data
    }
}