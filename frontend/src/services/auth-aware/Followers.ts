import UserFillData from "../../models/user/UserFillData";
import AuthAware from "./AuthAware";

export interface FollowersResponse {
    users: UserFillData[],
    usersNum: number
}

export default class Followers extends AuthAware {
    async getFollowers(): Promise<FollowersResponse> {
        const response = await this.axiosInstance.get<FollowersResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/follows/followers`)
        return response.data
    }
}