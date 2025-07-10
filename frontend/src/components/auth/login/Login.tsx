import { useForm } from 'react-hook-form'
import './Login.css'
import LoginModel from '../../../models/user/Login'
import auth from '../../../services/auth'
import { useContext } from 'react'
import { AuthContext } from '../auth/Auth'
import { useNavigate } from 'react-router-dom'

export default function Login(): JSX.Element {

    const { register, handleSubmit, formState } = useForm<LoginModel>()

    const { newLogin } = useContext(AuthContext)!

    const navigate = useNavigate()

    async function submit(login: LoginModel) {
        const jwt = await auth.login(login)
        // here i need to code something that will set the JWT in the AuthContext state
        newLogin(jwt)
        navigate(`/profile`)
    }

    function signUpPage() {
        navigate(`/signup`)
    }

    return (
        <div className='LoginContainer'>
            <div className='Login'>
                <label>Login: </label> <br />
                <form onSubmit={handleSubmit(submit)}>
                    <input placeholder='username' {...register('username')} />
                    <span className='error'>{formState.errors.username?.message}</span>

                    <br />
                    <input placeholder='password' type="password" {...register('password')} />
                    <span className='error'>{formState.errors.password?.message}</span>
                    <br />
                    <button>Login</button>
                </form>

                <br /><br />
                Not have a user?
                <br />
                <button onClick={signUpPage}>sign up</button>
            </div>
        </div>
    )
}