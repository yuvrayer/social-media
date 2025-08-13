import CommentLikes from "../../models/comment/CommentLikes"
import PostLikes from "../../models/post/PostLikes"
import AuthAware from "./AuthAware"

export default class Likes extends AuthAware {
    async getAllCommentsLikes(): Promise<CommentLikes[]> {
        const response = await this.axiosInstance.get<CommentLikes[]>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/getAllCommentsLikes`)
        return response.data
    }

    async getAllPostsLikes(): Promise<PostLikes[]> {
        const response = await this.axiosInstance.get<PostLikes[]>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/getAllPostsLikes`)
        return response.data
    }

    async addCommentLike(commentId: string): Promise<CommentLikes> {
        const response = await this.axiosInstance.post<CommentLikes>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/addComment/${commentId}`)
        return response.data
    }

    async addPostLike(postId: string): Promise<PostLikes> {
        const response = await this.axiosInstance.post<PostLikes>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/addPost/${postId}`)
        return response.data
    }

    async removeCommentLike(commentId: string): Promise<CommentLikes> {
        const response = await this.axiosInstance.delete<CommentLikes>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/removeComment/${commentId}`)
        return response.data
    }

    async removePostLike(postId: string): Promise<PostLikes> {
        const response = await this.axiosInstance.delete<PostLikes>(`${import.meta.env.VITE_REST_SERVER_URL}/likes/removePost/${postId}`)
        return response.data
    }

}
