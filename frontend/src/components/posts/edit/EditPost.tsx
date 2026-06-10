import { useNavigate, useParams } from 'react-router-dom'
import './EditPost.css'
import { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import PostDraft from '../../../models/post/PostDraft'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import { updatePost } from '../../../redux/profileSlice'
import useService from '../../../hooks/useService'
import ProfileService from '../../../services/auth-aware/Profile'
import loadingImageSource from '../../../assets/images/loading.webp'

export default function EditPost(): JSX.Element {

    const [previewImageSrc, setPreviewImageSrc] = useState<string>('')
    const [removeImage, setRemoveImage] = useState(false)

    const { id } = useParams<'id'>()
    const { handleSubmit, register, formState, reset, setValue } = useForm<PostDraft>()
    const navigate = useNavigate()

    const post = useAppSelector(state => state.profile.posts.find(p => p.id === id))
    const dispatch = useAppDispatch()

    const profileService = useService(ProfileService)

    useEffect(() => {
        if (id && post) {
            // profileService.getPost(id)
            //     .then(reset)
            //     .catch(alert)
            const { title, body, imageUrl } = post
            reset({ title, body })
            if (imageUrl) {
                setPreviewImageSrc(imageUrl)
            }
        }
    }, [id, post, reset])

    function deleteImage() {
        setPreviewImageSrc('')
        setValue('postImage', undefined as unknown as File) // clear file input
        setRemoveImage(true)
    }

    function previewImage(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files && event.currentTarget.files[0]
        if (file) {
            const imageSource = URL.createObjectURL(file)
            setPreviewImageSrc(imageSource)
        }
    }

    async function submit(draft: PostDraft) {
        try {
            if (id) {
                if (removeImage)
                    draft.postImage = (undefined as unknown as File)
                const updatedPost = await profileService.update(id, draft)
                dispatch(updatePost(updatedPost))
                navigate('/profile')
            }
        } catch (e) {
            alert(e)
        }
    }

    return (
        <div className='EditPost'>
            <form onSubmit={handleSubmit(submit)}>
                <input placeholder='title' {...register('title', {
                    required: {
                        value: true,
                        message: 'you must provide a title'
                    },
                    minLength: {
                        value: 10,
                        message: 'title must be 10 chars long'
                    }
                })} />
                <span className='error'>{formState.errors.title?.message}</span>
                <textarea placeholder='post body' {...register('body', {
                    required: {
                        value: true,
                        message: 'you must provide a body'
                    },
                    minLength: {
                        value: 20,
                        message: 'body must be 10 chars long'
                    },
                })} />
                <span className='error'>{formState.errors.body?.message}</span>
                <input type="file" accept='image/png, image/jpeg, image/jpg' {...register('postImage')} onChange={previewImage} />

                {previewImageSrc && (
                    <div>
                        <img src={previewImageSrc} alt="preview" width={200} />
                        <br />
                        <button type="button" onClick={deleteImage}>
                            Delete image
                        </button>
                    </div>
                )}

                {!formState.isSubmitting && <button type='submit'>Update Post</button>}
                {formState.isSubmitting &&
                    <p>
                        posting new post...
                        <i><img src={loadingImageSource} /></i>
                    </p>}

            </form>
        </div>
    )
}