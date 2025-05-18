import express from "express"
import { getAiSuggestions } from "../controllers/aiController.js"
import { auth, isStudent } from "../middleware/auth.js"

const router = express.Router()

// Student routes
router.get("/suggestions", auth, isStudent, getAiSuggestions)

export default router
