import AuthAware from "./AuthAware";
import SawStoryBy from "../../models/story/SawStoryBy.ts"
import StoryResponse from "../../models/story/StoryResponse.ts";

export default class Story extends AuthAware {
    async getStoriesData(currentUserId: string): Promise<StoryResponse[]> {
        const response = await this.axiosInstance.get<StoryResponse[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/getStories/${currentUserId}`)
        return response.data
    }

    async deleteStory(userId: string, storyId: string): Promise<StoryResponse> {
        const response = await this.axiosInstance.delete<StoryResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/story/delete/${userId}/${storyId}`)
        return response.data
    }

    async addStory(userId: string, story: File, profileImgUrl: string, name: string): Promise<StoryResponse> {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('storyImage', story)
        formData.append('newStory', 'true')
        formData.append('profileImgUrl', profileImgUrl ? profileImgUrl : `il.co.yuvalrayer/profile.jpg`)
        formData.append('name', name)

        const response = await this.axiosInstance.post<StoryResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/story/addStory`, formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        return response.data
    }

    async getUserStories(userId: string): Promise<StoryResponse[]> {
        const response = await this.axiosInstance.get<StoryResponse[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/get/${userId}`)
        return response.data
    }

    async getViewedStoryIds(): Promise<SawStoryBy[]> {
        const response = await this.axiosInstance.get<SawStoryBy[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/getSeenStories`)
        return response.data
    }

    async markStoryAsViewed(userIdUploaded: string, userIdSaw: string, storyId: string): Promise<SawStoryBy> {
        const response = await this.axiosInstance.post<SawStoryBy>(`${import.meta.env.VITE_REST_SERVER_URL}/story/addSaw`, { userIdUploaded, userIdSaw, storyId })
        return response.data
    }

    async getUserStoriesHistory(): Promise<StoryResponse[]> {
        const response = await this.axiosInstance.get<StoryResponse[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/getUserStoriesHistory`)
        return response.data
    }    
}