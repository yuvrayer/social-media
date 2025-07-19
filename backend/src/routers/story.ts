import { Router } from "express"
import enforceAuth from "../middlewares/enforce-auth"
import { addSaw, addStory, deleteStory, getStoryList, getUserStories, getUserStoriesSeenData } from "../controllers/story/controller"
import validation from "../middlewares/validation"
import { addSawValidator, deleteStoryParamsValidator, newStoryFilesValidator, storyListParams, storyValidator } from "../controllers/story/validator"
import filesValidation from "../middlewares/files-validation"
import fileUploader from "../middlewares/file-uploader"
import paramsValidation from "../middlewares/params-validation"

const storyRouter = Router()

storyRouter.use(enforceAuth)

storyRouter.get('/get/:userId', getUserStories)
storyRouter.get('/getStories/:currentUserId', paramsValidation(storyListParams), getStoryList)
storyRouter.get('/getSeenStories', getUserStoriesSeenData)
storyRouter.post('/addSaw', validation(addSawValidator), addSaw)
storyRouter.post('/addStory', validation(storyValidator), filesValidation(newStoryFilesValidator), fileUploader, addStory)
storyRouter.delete('/delete/:userId/:storyId', paramsValidation(deleteStoryParamsValidator), deleteStory)
// storyRouter.post('/addStory', fileUploader, addStory)

export default storyRouter