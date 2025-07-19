export default interface Story {
    id?: string,
    name: string,
    profileImgUrl: string,
    hasStory: boolean,
    storyImgUrl: string,
    userId: string,
    createdAt?: Date
}