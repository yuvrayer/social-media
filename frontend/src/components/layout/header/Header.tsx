import { NavLink, useNavigate } from 'react-router-dom'
import './Header.css'
import useUsername from '../../../hooks/useUsername'
import { useContext } from 'react'
import { AuthContext } from '../../auth/auth/Auth'

export default function Header() {

    const name = useUsername()

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
                Hello {name} | <button onClick={logMeOut}>logout</button>
            </div>
        </div>
    )
}