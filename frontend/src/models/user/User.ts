import Change from "./Change";

export default interface User extends Change {
    name: string,
    profileImgUrl: string,
    createdAt: string,
    updatedAt: string
}