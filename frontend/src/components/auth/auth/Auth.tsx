import { createContext, PropsWithChildren, useState } from 'react'
import './Auth.css'
import { useNavigate } from 'react-router-dom'


interface AuthContextInterface {
    jwt: string,
    newLogin(jwt: string): void,
    logout(): void
}

export const AuthContext = createContext<AuthContextInterface | null>(null)

export default function Auth(props: PropsWithChildren): JSX.Element {

    const JWT_KEY_NAME = 'jwt'

    const [jwt, setJwt] = useState<string>(localStorage.getItem(JWT_KEY_NAME) || '')

    const { children } = props

    function newLogin(jwt: string) {
        setJwt(jwt)
        localStorage.setItem(JWT_KEY_NAME, jwt)
    }
    const navigate = useNavigate()

    function logout() {
        localStorage.removeItem(JWT_KEY_NAME)
        setJwt('')
        navigate(`/login`)
    }

    return (
        <AuthContext.Provider value={{ jwt, newLogin, logout }} >
            {children}
        </AuthContext.Provider>
    )
}