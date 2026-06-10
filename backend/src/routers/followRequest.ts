import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import { cancelFollowRequest, deleteFollowRequest, getAllPendingRequestsIReceived, getAllPendingRequestsISent, sendFollowRequest } from "../controllers/followRequest/controller";
import paramsValidation from "../middlewares/params-validation";
import { deleteRequestParamsValidator, followRequestParamsValidator, sendFollowRequestValidator } from "../controllers/followRequest/validator";
import validation from "../middlewares/validation";

const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//gives all the follow requests i received (the user names)
router.get('/getAllPendingRequestsIReceived', getAllPendingRequestsIReceived)

//gives all the follow requests i sent (the user names)
router.get('/getAllPendingRequestsISent', getAllPendingRequestsISent)

//send a follow request to a user, by his Id
router.post('/sendFollowRequest/:userId', paramsValidation(followRequestParamsValidator), validation(sendFollowRequestValidator), sendFollowRequest)

//delete a follow request to a user, by his Id (by the sender regret)
router.delete('/deleteFollowRequest/:userId', paramsValidation(deleteRequestParamsValidator), deleteFollowRequest)

//delete a follow request to a user, by his Id (by the reciver cancel)
router.delete('/cancelFollowRequest/:userId', paramsValidation(deleteRequestParamsValidator), cancelFollowRequest)

export default router