import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import batchRoutes from "./routes/batch.js"
import roadmapRoutes from "./routes/roadmap.js"
import taskRoutes from "./routes/task.js"
import submissionRoutes from "./routes/submission.js"
import doubtRoutes from "./routes/doubt.js"
import notificationRoutes from "./routes/notification.js"
import aiRoutes from "./routes/ai.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(express.json())
app.use(cors())

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/batches", batchRoutes)
app.use("/api/roadmaps", roadmapRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/doubts", doubtRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/ai", aiRoutes)

app.get("/", (req, res) => {
  res.send("Student Task Tracker API is running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
