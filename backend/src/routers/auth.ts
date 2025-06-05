import { Router } from "express";
import validation from "../middlewares/validation";
import { changeDetailValidator, loginValidator, signupFilesValidator, signupValidator } from "../controllers/auth/validator";
import { changeDetail, login, signup } from "../controllers/auth/controller";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";

const router = Router()

router.post('/login', validation(loginValidator), login)
router.post('/signup', validation(signupValidator), filesValidation(signupFilesValidator), fileUploader, signup)
router.patch('/signup', validation(changeDetailValidator), filesValidation(signupFilesValidator), fileUploader, changeDetail)

export default router