import express from "express"
import { createTask, getTasksByRoadmap, getTaskById, updateTask, deleteTask } from "../controllers/taskController.js"
import { auth, isTutor } from "../middleware/auth.js"

const router = express.Router()

// Tutor routes
router.post("/", auth, isTutor, createTask)
router.put("/:id", auth, isTutor, updateTask)
router.delete("/:id", auth, isTutor, deleteTask)

// Common routes
router.get("/roadmap/:roadmapId", auth, getTasksByRoadmap)
router.get("/:id", auth, getTaskById)

export default router
