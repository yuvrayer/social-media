import { Router } from "express";
import { createPost, deletePost, fillUserData, getPost, getProfile, updatePost } from "../controllers/profile/controller";
import validation from "../middlewares/validation";
import { deletePostParamsValidator, fillUserDataValidator, getPostParamsValidator, getProfileValidator, newPostFilesValidator, newPostValidator, updatePostParamsValidator, updatePostValidator } from "../controllers/profile/validator";
import enforceAuth from "../middlewares/enforce-auth";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";
import paramsValidation from "../middlewares/params-validation";

const profileRouter = Router()

profileRouter.use(enforceAuth)

profileRouter.get('/:userId', paramsValidation(getProfileValidator), getProfile)
profileRouter.get('/post/:id', paramsValidation(getPostParamsValidator), getPost)
profileRouter.delete('/:id', paramsValidation(deletePostParamsValidator), deletePost)
profileRouter.post('/', validation(newPostValidator), filesValidation(newPostFilesValidator), fileUploader, createPost)
profileRouter.patch('/:id', validation(updatePostValidator), paramsValidation(updatePostParamsValidator), updatePost)
profileRouter.get(`/fill/:id`, paramsValidation(fillUserDataValidator), fillUserData)

export default profileRouter