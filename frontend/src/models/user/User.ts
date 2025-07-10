import Change from "./Change";

export default interface User extends Change {
    profileImgUrl: string,
    createdAt: string,
    updatedAt: string
}