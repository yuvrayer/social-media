import { useForm } from 'react-hook-form'
import './Signup.css'
import auth from '../../../services/auth'
import { ChangeEvent, useContext, useState } from 'react'
import { AuthContext } from '../auth/Auth'
import { useNavigate } from 'react-router-dom'
import SignupModel from '../../../models/user/Signup'
import { AxiosError } from 'axios'

export default function Signup(): JSX.Element {

    const { register, handleSubmit, formState, setError } = useForm<SignupModel>()

    const { newLogin } = useContext(AuthContext)!

    async function submit(signup: SignupModel) {
        signup.profileImg = (signup.profileImg as unknown as FileList)[0]

        try {
            const jwt = await auth.signup(signup)
            // here i need to code something that will set the JWT in the AuthContext state
            newLogin(jwt)
        } catch (e) {
            const err = e as AxiosError<{ message?: string }>

            const { message } = err.response?.data || {}

            if (err.response?.status === 409) {
                // Set the error on the correct field
                if (message === 'Username already taken') {
                    setError('username', { type: 'server', message })
                }
                else if (message === 'Name is in use already') {
                    setError('name', { type: 'server', message })
                }
                else {
                    alert(message || 'Signup conflict occurred')
                }
            } else {
                // Fallback
                alert(message || 'An unexpected error occurred')
            }
        }
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
        <div className='SignupContainer'>
            <div className='Signup'>
                <h1>Sign up: </h1>
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
                    <input placeholder='name' {...register('name', {
                        required: {
                            value: true,
                            message: 'you must provide a name'
                        },
                        pattern: {
                            value: /^[a-zA-Z0-9]+$/,
                            message: "Name must only contain letters and numbers"
                        },
                        minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters",
                        },
                        maxLength: {
                            value: 40,
                            message: "Name must be at most 40 characters",
                        }
                    })} />
                    <span className='error'>{formState.errors.name?.message}</span>
                    <br />

                    <input placeholder='password' type="password" {...register('password', {
                        required: {
                            value: true,
                            message: 'you must provide a password'
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
                    <span className='error'>{formState.errors.password?.message}</span>
                    <br /><br />

                    <span>profile pic (optional): </span>
                    <input type="file" {...register(`profileImg`)} onChange={previewImage} ></input> <br />
                    {previewImageSrc && <img src={previewImageSrc} />}

                    <br />
                    <button>Sign up</button>
                </form>

                <br /><br />
                Already have a user?
                <br />
                <button onClick={loginPage}>log in</button>
            </div>
        </div>
    )
}