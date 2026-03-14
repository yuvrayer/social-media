import { Router } from "express";
import paramsValidation from "../middlewares/params-validation";
import { getGamesBestScoresParamsValidator, newGameBestScoreBodyValidator, newGameBestScoreParamsValidator } from "../controllers/games/validator";
import { getGamesBestScores, newGameBestScore } from "../controllers/games/controller";
import validation from "../middlewares/validation";
import enforceAuth from "../middlewares/enforce-auth";

const router = Router()

router.use(enforceAuth)

router.get('/getGamesBestScores/:gameCode', paramsValidation(getGamesBestScoresParamsValidator), getGamesBestScores)
router.post('/newGameBestScore/:gameCode', paramsValidation(newGameBestScoreParamsValidator), validation(newGameBestScoreBodyValidator), newGameBestScore)

export default router