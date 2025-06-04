import { useForm } from 'react-hook-form'
import './Signup.css'
import auth from '../../../services/auth'
import { useContext } from 'react'
import { AuthContext } from '../auth/Auth'
import { useNavigate } from 'react-router-dom'
import SignupModel from '../../../models/user/Signup'

export default function Signup(): JSX.Element {

    const { register, handleSubmit } = useForm<SignupModel>()

    const { newLogin } = useContext(AuthContext)!

    async function submit(signup: SignupModel) {
        const jwt = await auth.signup(signup)
        // here i need to code something that will set the JWT in the AuthContext state
        newLogin(jwt)
    }

    const navigate = useNavigate()

    function loginPage() {
        navigate(`/login`)
    }

    return (
        <div className='Signup'>
            Sign up: <br /><br />
            <form onSubmit={handleSubmit(submit)}>
                <input placeholder='username' {...register('username')} />
                <input placeholder='name' {...register('name')} />
                <input placeholder='password' type="password" {...register('password')} />
                <button>Sign up</button>
            </form>

            <br /><br />
            Already have a user?
            <br />
            <button onClick={loginPage}>log in</button>
        </div>
    )
}