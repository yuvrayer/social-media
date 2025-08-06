import { Router } from "express";
import enforceAuth from "../middlewares/enforce-auth";
import { cancelFollowRequest, deleteFollowRequest, getAllPendingRequestsIReceived, getAllPendingRequestsISent, sendFollowRequest } from "../controllers/followRequest/controller";
import paramsValidation from "../middlewares/params-validation";
import { deleteRequestParamsValidator, followRequestParamsValidator } from "../controllers/followRequest/validator";

const router = Router()

router.use(enforceAuth)

router.get('/getAllPendingRequestsIReceived', getAllPendingRequestsIReceived)
router.get('/getAllPendingRequestsISent', getAllPendingRequestsISent)
router.post('/sendFollowRequest/:userId', paramsValidation(followRequestParamsValidator), sendFollowRequest)
router.delete('/deleteFollowRequest/:userId', paramsValidation(deleteRequestParamsValidator), deleteFollowRequest)
router.delete('/cancelFollowRequest/:userId', paramsValidation(deleteRequestParamsValidator), cancelFollowRequest)

export default router