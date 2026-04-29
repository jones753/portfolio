import dotenv from "dotenv"
import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import healthRouter from "./routes/healthRoutes.js"
import githubRouter from "./routes/githubRoutes.js"
import spotifyRouter from "./routes/spotifyRoutes.js"

dotenv.config()

const app = express()
const port = Number(process.env.PORT || process.env.BACKEND_PORT || 4000)
const host = process.env.HOST || "0.0.0.0"

const trustProxy =
  process.env.TRUST_PROXY === undefined ? 1 : Number(process.env.TRUST_PROXY)
app.set("trust proxy", trustProxy)

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000)
const rateLimitApiMax = Number(process.env.RATE_LIMIT_API_MAX || 120)
const rateLimitUpstreamMax = Number(process.env.RATE_LIMIT_UPSTREAM_MAX || 30)

const isUpstreamRoute = (req) =>
  req.originalUrl?.startsWith("/api/github") ||
  req.originalUrl?.startsWith("/api/spotify")

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  // Support both v6 (`max`) and v7+ (`limit`) option names.
  max: rateLimitApiMax,
  limit: rateLimitApiMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: isUpstreamRoute,
  message: { error: "Too many requests" },
})

const upstreamLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitUpstreamMax,
  limit: rateLimitUpstreamMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests" },
})

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
app.use("/api", apiLimiter)
app.use("/api/github", upstreamLimiter)
app.use("/api/spotify", upstreamLimiter)
app.use("/api", githubRouter)
app.use("/api", spotifyRouter)

app.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`)
})
