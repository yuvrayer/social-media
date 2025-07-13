import { Router } from "express"
import enforceAuth from "../middlewares/enforce-auth"
import { addSaw, addStory, getStoryList, getUserStories, getUserStoriesSeenData } from "../controllers/story/controller"
import validation from "../middlewares/validation"
import { addSawValidator, newStoryFilesValidator, storyValidator } from "../controllers/story/validator"
import filesValidation from "../middlewares/files-validation"
import fileUploader from "../middlewares/file-uploader"

const storyRouter = Router()

storyRouter.use(enforceAuth)

storyRouter.get('/', getStoryList)
storyRouter.get('/get/:userId', getUserStories)
storyRouter.get('/getSeenStories', getUserStoriesSeenData)
storyRouter.post('/addSaw', validation(addSawValidator), addSaw)
storyRouter.post('/addStory', validation(storyValidator), filesValidation(newStoryFilesValidator), fileUploader, addStory)
// storyRouter.post('/addStory', fileUploader, addStory)

export default storyRouter