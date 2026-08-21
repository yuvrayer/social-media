import Post from "../../models/post/Post";
import PostDraft from "../../models/post/PostDraft";
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
        const formData = new FormData();

        formData.append("title", draft.title);
        formData.append("body", draft.body);
        if (draft.postImage instanceof FileList && draft.postImage.length > 0) {
            formData.append("postImage", draft.postImage[0]);
        } else if (draft.postImage === "") {
            formData.append("postImage", "");
        } else if (draft.postImage) {
            formData.append("postImage", draft.postImage)
        }

        const response = await this.axiosInstance.patch<Post>(`${import.meta.env.VITE_REST_SERVER_URL}/profile/${id}`, formData)
        return response.data
    }
}
