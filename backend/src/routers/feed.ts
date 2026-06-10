import { Router } from "express";
import { getFeed } from "../controllers/feed/controller";
import enforceAuth from "../middlewares/enforce-auth";
import paramsValidation from "../middlewares/params-validation";
import { feedParamsValidator } from "../controllers/feed/validator";

const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//gets the user feed from the database
router.get('/:userId', paramsValidation(feedParamsValidator), getFeed)

export default router