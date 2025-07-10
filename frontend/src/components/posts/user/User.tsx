import useProfileImg from '../../../hooks/useProfileImg'
import useName from '../../../hooks/useName'
import './User.css'
import profilePicSource from '../../../assets/images/profile.jpg'
import auth from '../../../services/auth'
import { useContext } from 'react'
import { AuthContext } from '../../auth/auth/Auth'
import { useForm } from 'react-hook-form'
import useUserId from '../../../hooks/useUserId'
import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import Change from '../../../models/user/Change'

export default function User() {
    const name = useName()
    const profileImgUrl = useProfileImg()
    const id = useUserId()
    const { newLogin } = useContext(AuthContext)!
    const navigate = useNavigate()
    const [newProfileImg, setNewProfileImg] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null) // Reference to hidden file input
    const [removeProfileImg, setRemoveProfileImg] = useState<boolean>(false)

    async function changeInfo(updatedInfo: Change) {
        if (!updatedInfo.name) updatedInfo.name = name
        const file = fileInputRef.current?.files?.[0]
        updatedInfo.alreadyPic = ``
        if (removeProfileImg) {
            updatedInfo.profileImg = null
        } else if (file) {
            updatedInfo.profileImg = file
        }
        else if (profileImgUrl) {
            updatedInfo.alreadyPic = profileImgUrl
        }

        const jwt = await auth.changeDetail({ ...updatedInfo, id })
        newLogin(jwt)
        navigate(`/profile`)
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewProfileImg(reader.result as string)
                setRemoveProfileImg(false)
            }
            reader.readAsDataURL(file)
        }
    }

    function removeImg() {
        setNewProfileImg(null)
        setRemoveProfileImg(true)
    }

    const { register, handleSubmit } = useForm<Change>()

    return (
        <div className='User'>
            <h1>Change Your Profile Data</h1>
            Current user name: {name} <br /> <br />
            Change your user name:
            <form onSubmit={handleSubmit(changeInfo)}>
                <input placeholder='Change user name' {...register(`name`)} /> <br /><br />

                Profile image: <br />
                <div className='UserImg'>
                    {newProfileImg ? (
                        <img src={newProfileImg} {...register(`profileImg`)} />
                    ) : !removeProfileImg && profileImgUrl ? (
                        <img src={`${import.meta.env.VITE_AWS_SERVER_URL}/${profileImgUrl}`} {...register(`profileImg`)} />
                    ) : (
                        <img src={profilePicSource} {...register(`profileImg`)} />
                    )}
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }} // Hide file input
                    />
                    <button
                        type="button"
                        onClick={removeImg}
                    >
                        Delete
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()} // Programmatically click the file input
                    >
                        Edit
                    </button>
                </div> <br />
                <button>Save changes</button>
            </form>
        </div>
    )
}
