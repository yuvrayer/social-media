import { Router } from "express"
import enforceAuth from "../middlewares/enforce-auth"
import { addStory, getStoryList, getUserStories } from "../controllers/story/controller"
import validation from "../middlewares/validation"
import { newStoryFilesValidator, storyValidator } from "../controllers/story/validator"
import filesValidation from "../middlewares/files-validation"
import fileUploader from "../middlewares/file-uploader"

const storyRouter = Router()

storyRouter.use(enforceAuth)

storyRouter.get('/', getStoryList)
storyRouter.get('/get/:userId', getUserStories)
storyRouter.post('/addStory', validation(storyValidator), filesValidation(newStoryFilesValidator), fileUploader, addStory)
// storyRouter.post('/addStory', fileUploader, addStory)

export default storyRouter