import { jwtDecode } from "jwt-decode"
import { useContext, useMemo } from "react"
import User from "../models/user/User"
import { AuthContext } from "../components/auth/auth/Auth"

export default function useProfileImg() {
    const { jwt } = useContext(AuthContext)!
    // const { name } = jwtDecode<User>(jwt)

    const profileImgUrl = useMemo(() => {
        const { profileImgUrl } = jwtDecode<User>(jwt)
        return profileImgUrl
    }, [jwt])

    return profileImgUrl
}