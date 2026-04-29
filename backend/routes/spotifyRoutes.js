import { Router } from "express"
import {
  getNowPlaying,
  getRecentlyPlayed,
  getTopTracks,
} from "../controllers/spotifyController.js"

const spotifyRouter = Router()

spotifyRouter.get("/spotify/now-playing", getNowPlaying)

spotifyRouter.get("/spotify/top-tracks", getTopTracks)

spotifyRouter.get("/spotify/recently-played", getRecentlyPlayed)

export default spotifyRouter
