import { useForm } from 'react-hook-form'
import './Signup.css'
import auth from '../../../services/auth'
import { ChangeEvent, useContext, useState } from 'react'
import { AuthContext } from '../auth/Auth'
import { useNavigate } from 'react-router-dom'
import SignupModel from '../../../models/user/Signup'

export default function Signup(): JSX.Element {

    const { register, handleSubmit } = useForm<SignupModel>()

    const { newLogin } = useContext(AuthContext)!

    async function submit(signup: SignupModel) {
        signup.profileImg = (signup.profileImg as unknown as FileList)[0]
        const jwt = await auth.signup(signup)
        // here i need to code something that will set the JWT in the AuthContext state
        newLogin(jwt)
    }

    const navigate = useNavigate()

    function loginPage() {
        navigate(`/login`)
    }

    const [previewImageSrc, setPreviewImageSrc] = useState<string>('')

    function previewImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files && event.currentTarget.files[0]
        if (file) {
            const imageSource = URL.createObjectURL(file)
            setPreviewImageSrc(imageSource)
        }
    }

    return (
        <div className='Signup'>
            Sign up: <br /><br />
            <form onSubmit={handleSubmit(submit)}>
                <input placeholder='username' {...register('username')} />
                <input placeholder='name' {...register('name')} />
                <input placeholder='password' type="password" {...register('password')} />
                <span>profile pic (optional): </span>
                <input type="file" {...register(`profileImg`)} onChange={previewImage} ></input> <br />
                {previewImageSrc && <img src={previewImageSrc} />}


                <button>Sign up</button>
            </form>

            <br /><br />
            Already have a user?
            <br />
            <button onClick={loginPage}>log in</button>
        </div>
    )
}