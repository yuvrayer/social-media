import { useForm } from 'react-hook-form'
import './Login.css'
import LoginModel from '../../../models/user/Login'
import auth from '../../../services/auth'
import { useContext } from 'react'
import { AuthContext } from '../auth/Auth'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'

export default function Login(): JSX.Element {

    const { register, handleSubmit, formState } = useForm<LoginModel>()

    const { newLogin } = useContext(AuthContext)!

    const navigate = useNavigate()

    async function submit(login: LoginModel) {
        try {
            const jwt = await auth.login(login)
            // here i code something that will set the JWT in the AuthContext state
            newLogin(jwt)
            navigate(`/profile`)
        } catch (e) {
            const err = e as AxiosError<{ message?: string }>

            const { message } = err.response?.data || {}

            if (err.response?.status === 401) {
                if (message === 'wrong credentials') {
                    alert(`wrong credentials`)
                }
            } else {
                // Fallback
                alert('An unexpected error occurred')
            }
        }
    }

    function signUpPage() {
        navigate(`/signup`)
    }

    return (
        <div className='LoginContainer'>
            <div className='Login'>
                <label>Login: </label> <br />
                <form onSubmit={handleSubmit(submit)}>
                    <input placeholder='username' {...register('username', {
                        required: {
                            value: true,
                            message: 'you must provide a user name'
                        },
                        minLength: {
                            value: 6,
                            message: "Name must be at least 6 characters",
                        },
                        maxLength: {
                            value: 40,
                            message: "Name must be at most 40 characters",
                        }
                    })} />
                    <span className='error'>{formState.errors.username?.message}</span>

                    <br />
                    <input placeholder='password' type="password" {...register('password', {
                        required: {
                            value: true,
                            message: 'you must provide a password'
                        },
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                        },
                        maxLength: {
                            value: 40,
                            message: "Password must be at most 40 characters",
                        }
                    })} />
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