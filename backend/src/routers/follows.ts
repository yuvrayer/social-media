import { Router } from "express";
import { follow, getAllUsers, getFollowers, getFollowing, removeFromMyFollowers, unfollow } from "../controllers/follows/controller";
import paramsValidation from "../middlewares/params-validation";
import { followParamsValidator, followValidator, unfollowParamsValidator } from "../controllers/follows/validator";
import enforceAuth from "../middlewares/enforce-auth";
import validation from "../middlewares/validation";

const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//get all the signed users
router.get('/allUsers', getAllUsers)

//get all the user followers
router.get('/followers', getFollowers)

//get all the user followings
router.get('/following', getFollowing)

//approve the follow request
router.post('/follow/:id', paramsValidation(followParamsValidator), validation(followValidator), follow)

//unfollow a user
router.post('/unfollow/:id', paramsValidation(unfollowParamsValidator), unfollow)

//remove the user from following me
router.post('/removeFromMyFollowers/:id', paramsValidation(unfollowParamsValidator), removeFromMyFollowers)

export default router