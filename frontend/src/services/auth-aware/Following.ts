import User from "../../models/user/User";
import AuthAware from "./AuthAware";

export interface FollowingResponse {
    users: User[],
    usersNum: number
}

export default class Following extends AuthAware {
    async getFollowing(): Promise<FollowingResponse> {
        const response = await this.axiosInstance.get<FollowingResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/following`)
        return response.data
    }

    async getAllUsers(): Promise<User[]> {
        const response = await this.axiosInstance.get<User[]>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/allUsers`)
        return response.data
    }

    async unfollow(userId: string): Promise<boolean> {
        const response = await this.axiosInstance.post<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/unfollow/${userId}`)
        return response.data
    }

    async follow(userId: string): Promise<boolean> {
        const response = await this.axiosInstance.post<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/follow/${userId}`)
        return response.data
    }

}
