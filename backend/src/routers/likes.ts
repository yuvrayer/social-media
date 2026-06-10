import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import { addCommentLike, addPostLike, getAllCommentsLikes, getAllPostsLikes, removeCommentLike, removePostLike } from "../controllers/likes/controller";
import paramsValidation from "../middlewares/params-validation";
import { commentValidator, postValidator } from "../controllers/likes/validator";


const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//get all the comments i liked
router.get('/getAllCommentsLikes', getAllCommentsLikes)

//get all the posts i liked
router.get('/getAllPostsLikes', getAllPostsLikes)

//add a comment i like
router.post('/addComment/:commentId', paramsValidation(commentValidator), addCommentLike)

//add a post i like
router.post('/addPost/:postId', paramsValidation(postValidator), addPostLike)

//remove a like from a comment
router.delete('/removeComment/:commentId', paramsValidation(commentValidator), removeCommentLike)

//remove a like from a post
router.delete('/removePost/:postId', paramsValidation(postValidator), removePostLike)

export default router