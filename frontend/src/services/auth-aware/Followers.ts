import User from "../../models/user/User";
import AuthAware from "./AuthAware";

export interface FollowersResponse {
    users: User[],
    usersNum: number
}

export default class Followers extends AuthAware {
    async getFollowers(): Promise<FollowersResponse> {
        const response = await this.axiosInstance.get<FollowersResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/followers`)
        return response.data
    }
}