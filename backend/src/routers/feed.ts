import { Router } from "express";
import { getFeed } from "../controllers/feed/controller";
import enforceAuth from "../middlewares/enforce-auth";
import paramsValidation from "../middlewares/params-validation";
import { feedParamsValidator } from "../controllers/feed/validator";

const router = Router()

router.use(enforceAuth)

router.get('/:userId', paramsValidation(feedParamsValidator), getFeed)

export default router