import Post from "../../models/post/Post";
import AuthAware from "./AuthAware";

export interface FeedResponse {
    posts: Post[],
    postsNum: number
}

export default class Feed extends AuthAware {
    async getFeed(userId: string): Promise<FeedResponse> {
        const response = await this.axiosInstance.get<FeedResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/feed/${userId}`)
        return response.data
    }
}