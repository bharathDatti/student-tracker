import express from "express"
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  addStudentToBatch,
  removeStudentFromBatch,
  assignTutorToBatch,
  getBatchStats,
} from "../controllers/batchController.js"
import { auth, isAdmin } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.post("/", auth, isAdmin, createBatch)
router.put("/:id", auth, isAdmin, updateBatch)
router.delete("/:id", auth, isAdmin, deleteBatch)
router.post("/:id/students", auth, isAdmin, addStudentToBatch)
router.delete("/:id/students/:studentId", auth, isAdmin, removeStudentFromBatch)
router.post("/:id/tutor", auth, isAdmin, assignTutorToBatch)

// Admin and Tutor routes
router.get("/", auth, getAllBatches)
router.get("/:id", auth, getBatchById)
router.get("/:id/stats", auth, getBatchStats)

export default router
