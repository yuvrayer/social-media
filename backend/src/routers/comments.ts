import { Router } from "express";
import validation from "../middlewares/validation";
import { newCommentParamsValidator, newCommentValidator } from "../controllers/comments/validator";
import { createComment } from "../controllers/comments/controller";
import paramsValidation from "../middlewares/params-validation";
import enforceAuth from "../middlewares/enforce-auth";

const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//create new comment
router.post('/:postId', validation(newCommentValidator), paramsValidation(newCommentParamsValidator), createComment)
export default router