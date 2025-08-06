import Post from "../../models/post/Post";
import PostDraft from "../../models/post/PostDraft";
import UserFillData from "../../models/user/UserFillData";
import AuthAware from "./AuthAware";

export interface ProfileResponse {
    posts: Post[],
    postsNum: number
}

export default class Profile extends AuthAware {
    async getProfile(userId: string): Promise<ProfileResponse> {
        const response = await this.axiosInstance.get<ProfileResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/${userId}`)
        return response.data
    }

    async getPost(id: string): Promise<Post> {
        const response = await this.axiosInstance.get<Post>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/post/${id}`)
        return response.data
    }

    async remove(id: string): Promise<boolean> {
        const response = await this.axiosInstance.delete<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/${id}`)
        return response.data
    }

    async create(draft: PostDraft): Promise<Post> {
        const response = await this.axiosInstance.post<Post>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/`, draft, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        return response.data
    }

    async update(id: string, draft: PostDraft): Promise<Post> {
        const { title, body } = draft
        const response = await this.axiosInstance.patch<Post>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/${id}`, { title, body })
        return response.data
    }

    async fillUserData(id: string): Promise<UserFillData> {
        const response = await this.axiosInstance.get<UserFillData>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/fill/${id}`)
        return response.data
    }

}
