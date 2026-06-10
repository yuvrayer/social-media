import { Router } from "express";
import validation from "../middlewares/validation";
import { changeDetailValidator, loginValidator, signupFilesValidator, signupValidator } from "../controllers/auth/validator";
import { changeDetail, login, signup } from "../controllers/auth/controller";
import filesValidation from "../middlewares/files-validation";
import fileUploader from "../middlewares/file-uploader";

const router = Router()

//try to login
router.post('/login', validation(loginValidator), login)

//try to signup
router.post('/signup', validation(signupValidator), filesValidation(signupFilesValidator), fileUploader, signup)

//change a user detail- username/password
router.patch('/signup', validation(changeDetailValidator), filesValidation(signupFilesValidator), fileUploader, changeDetail)

export default router