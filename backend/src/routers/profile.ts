import { Router } from "express";
import { createPost, deletePost, getPost, getProfile, updatePost } from "../controllers/profile/controller";
import validation from "../middlewares/validation";
import { deletePostParamsValidator, getPostParamsValidator, getProfileValidator, newPostFilesValidator, newPostValidator, updatePostFilesValidator, updatePostParamsValidator, updatePostValidator } from "../controllers/profile/validator";
import enforceAuth from "../middlewares/enforce-auth";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";
import paramsValidation from "../middlewares/params-validation";

const profileRouter = Router()

//checks if the user identified properly (runs on every call to the router)
profileRouter.use(enforceAuth)

//get the user profile by his ID
profileRouter.get('/:userId', paramsValidation(getProfileValidator), getProfile)

//get a post by his Id
profileRouter.get('/post/:id', paramsValidation(getPostParamsValidator), getPost)

//remove a post by his Id
profileRouter.delete('/:id', paramsValidation(deletePostParamsValidator), deletePost)

//create a new post in the database
profileRouter.post('/', validation(newPostValidator), filesValidation(newPostFilesValidator), fileUploader, createPost)

//make a change in the post (by his Id)
profileRouter.patch('/:id', validation(updatePostValidator), paramsValidation(updatePostParamsValidator), filesValidation(updatePostFilesValidator), fileUploader, updatePost)

export default profileRouter