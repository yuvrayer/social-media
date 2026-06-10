import { Router } from "express";
import paramsValidation from "../middlewares/params-validation";
import { getGamesBestScoresParamsValidator, newGameBestScoreBodyValidator, newGameBestScoreParamsValidator } from "../controllers/games/validator";
import { getGamesBestScores, newGameBestScore } from "../controllers/games/controller";
import validation from "../middlewares/validation";
import enforceAuth from "../middlewares/enforce-auth";

const router = Router()

//checks if the user identified properly (runs on every call to the router)
router.use(enforceAuth)

//gets the specific game top best scores
router.get('/getGamesBestScores/:gameCode', paramsValidation(getGamesBestScoresParamsValidator), getGamesBestScores)

//sets a new top best score
router.post('/newGameBestScore/:gameCode', paramsValidation(newGameBestScoreParamsValidator), validation(newGameBestScoreBodyValidator), newGameBestScore)

export default router