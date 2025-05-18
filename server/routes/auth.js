import express from "express"
import { register, login, getProfile } from "../controllers/authController.js"
import { auth, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Public routes
router.post("/login", login)

// Protected routes
router.post("/register", auth, isAdmin, register) // Only admin can register new users
router.get("/profile", auth, getProfile)

export default router
