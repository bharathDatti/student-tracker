import express from "express"
import {
  createRoadmap,
  getRoadmapsByBatch,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  getRoadmapWithTasks,
} from "../controllers/roadmapController.js"
import { auth, isTutor } from "../middleware/auth.js"

const router = express.Router()

// Tutor routes
router.post("/", auth, isTutor, createRoadmap)
router.put("/:id", auth, isTutor, updateRoadmap)
router.delete("/:id", auth, isTutor, deleteRoadmap)

// Common routes
router.get("/batch/:batchId", auth, getRoadmapsByBatch)
router.get("/:id", auth, getRoadmapById)
router.get("/:id/tasks", auth, getRoadmapWithTasks)

export default router
