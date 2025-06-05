import useProfileImg from '../../../hooks/useProfileImg'
import useUsername from '../../../hooks/useUsername'
import './User.css'
import profilePicSource from '../../../assets/images/profile.jpg'
import auth from '../../../services/auth'
import Signup from '../../../models/user/Signup'
import { useContext } from 'react'
import { AuthContext } from '../../auth/auth/Auth'
import { useForm } from 'react-hook-form'
import useUserId from '../../../hooks/useUserId'
import { useNavigate } from 'react-router-dom'

export default function User() {

    const username = useUsername()
    const profileImgUrl = useProfileImg()
    const id = useUserId()
    const { newLogin } = useContext(AuthContext)!
    const navigate = useNavigate()

    async function changeName(signup: Signup) {
        const jwt = await auth.changeDetail({...signup, id})
        newLogin(jwt)
        navigate(`/profile`)
    }

    const { register, handleSubmit } = useForm<Signup>()

    return (
        <div className='User'>
            user name : {username} <br />
            change your user name:
            <form onSubmit={handleSubmit(changeName)}>
                <input placeholder='change name' {...register(`name`)}></input> <br />

                profile image: {profileImgUrl && <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`} {...register(`profileImg`)} />}
                {!profileImgUrl && <img src={profilePicSource} {...register(`profileImg`)} />}
                <button>Change</button>
            </form>

        </div>
    )
}