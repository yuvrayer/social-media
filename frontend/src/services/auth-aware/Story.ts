import AuthAware from "./AuthAware";
import StoryModel from "../../models/story/Story.ts";
import SawStoryBy from "../../models/story/SawStoryBy.ts"

interface AddStoryResponse {
    createdAt: string,
    id: string,
    storyImgUrl: string,
    updatedAt: string,
    userId: string,
    profileImgUrl: string,
    name: string
}


export default class Story extends AuthAware {
    async getStoriesData(currentUserId: string): Promise<StoryModel[]> {
        const response = await this.axiosInstance.get<StoryModel[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/getStories/${currentUserId}`)
        return response.data
    }

    async deleteStory(userId: string, storyId: string): Promise<StoryModel> {
        const response = await this.axiosInstance.delete<StoryModel>(`${import.meta.env.VITE_REST_SERVER_URL}/story/delete/${userId}/${storyId}`)
        return response.data
    }

    async addStory(userId: string, story: File, profileImgUrl: string, name: string): Promise<AddStoryResponse> {
        const formData = new FormData()
        formData.append('userId', userId)
        formData.append('storyImage', story)
        formData.append('newStory', 'true')
        formData.append('profileImgUrl', profileImgUrl ? profileImgUrl : `il.co.yuvalrayer/profile.jpg`)
        formData.append('name', name)

        const response = await this.axiosInstance.post<AddStoryResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/story/addStory`, formData, {
            headers: {
                "Content-Type": 'multipart/form-data'
            }
        })
        return response.data
    }

    async getUserStories(userId: string): Promise<StoryModel[]> {
        const response = await this.axiosInstance.get<StoryModel[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/get/${userId}`)
        return response.data
    }

    async getViewedStoryIds(): Promise<SawStoryBy[]> {
        const response = await this.axiosInstance.get<SawStoryBy[]>(`${import.meta.env.VITE_REST_SERVER_URL}/story/getSeenStories`)
        return response.data
    }


    async markStoryAsViewed(userIdUploaded: string, userIdSaw: string): Promise<SawStoryBy> {
        const response = await this.axiosInstance.post<SawStoryBy>(`${import.meta.env.VITE_REST_SERVER_URL}/story/addSaw`, { userIdUploaded, userIdSaw })
        return response.data
    }

}