import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'
import useUsername from '../../../hooks/useUsername'
import { useContext } from 'react'
import { AuthContext } from '../../auth/auth/Auth'
import useProfileImg from '../../../hooks/useProfileImg'
import profilePicSource from '../../../assets/images/profile.jpg'

export default function Header() {

    const name = useUsername()
    const profileImgUrl = useProfileImg()

    const { logout } = useContext(AuthContext)!
    const navigate = useNavigate()
    window.addEventListener('popstate', function (event) {
        event.preventDefault(); // Some browsers require this for custom messages
        logMeOut()
    });

    function logMeOut() {
        logout()
        navigate(`/login`)
    }

    function navigateToUser() {
        navigate(`/user`)
    }

    return (
        <div className='Header'>
            <div>
                Logo
            </div>
            <div>
                <nav>
                    <NavLink to="/profile">profile</NavLink>
                    <NavLink to="/feed">feed</NavLink>
                    <NavLink to="/search">search</NavLink>
                </nav>
            </div>
            <div>
                Hello {name} | {profileImgUrl && <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`} onClick={navigateToUser} />} {!profileImgUrl && <img src={profilePicSource} onClick={navigateToUser} />}| <button onClick={logMeOut}>logout</button>
            </div>
        </div>
    )
}