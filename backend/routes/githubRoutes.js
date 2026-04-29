import { Router } from "express"
import { getGithubHighlights } from "../controllers/githubController.js"

const githubRouter = Router()

githubRouter.get("/github", getGithubHighlights)

export default githubRouter
