import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import { addCommentLike, addPostLike, getAllCommentsLikes, getAllPostsLikes, removeCommentLike, removePostLike } from "../controllers/likes/controller";
import paramsValidation from "../middlewares/params-validation";
import { commentValidator, postValidator } from "../controllers/likes/validator";


const router = Router()

router.use(enforceAuth)

router.get('/getAllCommentsLikes', getAllCommentsLikes)
router.get('/getAllPostsLikes', getAllPostsLikes)
router.post('/addComment/:commentId', paramsValidation(commentValidator), addCommentLike)
router.post('/addPost/:postId', paramsValidation(postValidator), addPostLike)
router.delete('/removeComment/:commentId', paramsValidation(commentValidator), removeCommentLike)
router.delete('/removePost/:postId', paramsValidation(postValidator), removePostLike)

export default router