import dotenv from "dotenv"
import cors from "cors"
import express from "express"
import healthRouter from "./routes/healthRoutes.js"
import githubRouter from "./routes/githubRoutes.js"
import spotifyRouter from "./routes/spotifyRoutes.js"

dotenv.config()

const app = express()
const port = Number(process.env.PORT || process.env.BACKEND_PORT || 4000)
const host = process.env.HOST || "0.0.0.0"

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }
      callback(new Error("Not allowed by CORS"))
    },
  }),
)
app.use(express.json())
app.use(healthRouter)
app.use("/api", githubRouter)
app.use("/api", spotifyRouter)

app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`)
})
