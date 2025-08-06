import UserFillData from "../../models/user/UserFillData";
import AuthAware from "./AuthAware";

export interface FollowingRequestResponse {
    users: UserFillData[],
    usersNum: number
}

export default class FollowingRequest extends AuthAware {
    async getAllPendingRequestsIReceived(): Promise<FollowingRequestResponse> {
        const response = await this.axiosInstance.get<FollowingRequestResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/request/getAllPendingRequestsIReceived`)
        return response.data
    }

    async getAllPendingRequestsISent(): Promise<FollowingRequestResponse> {
        const response = await this.axiosInstance.get<FollowingRequestResponse>(`${import.meta.env.VITE_REST_SERVER_URL}/request/getAllPendingRequestsISent`)
        return response.data
    }
    
    async sendFollowRequest(userId: string): Promise<boolean> {
        const response = await this.axiosInstance.post<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/request/sendFollowRequest/${userId}`)
        return response.data
    }

    async deleteFollowRequest(userId: string): Promise<boolean> {
        const response = await this.axiosInstance.delete<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/request/deleteFollowRequest/${userId}`)
        return response.data
    }

    async cancelFollowRequest(userId: string): Promise<boolean> {
        const response = await this.axiosInstance.delete<boolean>(`${import.meta.env.VITE_REST_SERVER_URL}/request/cancelFollowRequest/${userId}`)
        return response.data
    }
}
