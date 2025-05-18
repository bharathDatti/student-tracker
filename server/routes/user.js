import express from "express"
import {
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
  getAdminStats,
  getTutorStats,
  getStudentStats,
} from "../controllers/userController.js"
import { auth, isAdmin, isTutor, isStudent } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.get("/role/:role", auth, isAdmin, getUsersByRole)
router.put("/:id", auth, isAdmin, updateUser)
router.delete("/:id", auth, isAdmin, deleteUser)
router.get("/admin/stats", auth, isAdmin, getAdminStats)

// Tutor routes
router.get("/tutor/stats", auth, isTutor, getTutorStats)

// Student routes
router.get("/student/stats", auth, isStudent, getStudentStats)

// Common routes
router.get("/:id", auth, getUserById)

export default router
