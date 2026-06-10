import { Router } from "express"
import enforceAuth from "../middlewares/enforce-auth"
import { addSaw, addStory, deleteStory, getStoryList, getUserStories, getUserStoriesHistory, getUserStoriesSeenData } from "../controllers/story/controller"
import validation from "../middlewares/validation"
import { addSawValidator, deleteStoryParamsValidator, newStoryFilesValidator, storyListParams, storyValidator } from "../controllers/story/validator"
import filesValidation from "../middlewares/files-validation"
import fileUploader from "../middlewares/file-uploader"
import paramsValidation from "../middlewares/params-validation"

const storyRouter = Router()

//checks if the user identified properly (runs on every call to the router)
storyRouter.use(enforceAuth)

//get all the user stories
storyRouter.get('/get/:userId', getUserStories)

//get the stories of my following list
storyRouter.get('/getStories/:currentUserId', paramsValidation(storyListParams), getStoryList)

//get the old stories of the user
storyRouter.get('/getUserStoriesHistory', getUserStoriesHistory)

//get the stories the user has seen
storyRouter.get('/getSeenStories', getUserStoriesSeenData)

//post to the database- the user is seeing a story
storyRouter.post('/addSaw', validation(addSawValidator), addSaw)

//add a new story
storyRouter.post('/addStory', validation(storyValidator), filesValidation(newStoryFilesValidator), fileUploader, addStory)

//delete a story
storyRouter.delete('/delete/:userId/:storyId', paramsValidation(deleteStoryParamsValidator), deleteStory)

export default storyRouter