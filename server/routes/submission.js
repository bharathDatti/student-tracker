import express from "express"
import {
  createSubmission,
  getSubmissionsByStudent,
  getSubmissionsForTutor,
  reviewSubmission,
  getSubmissionById,
  downloadSubmissionFile,
} from "../controllers/submissionController.js"
import { auth, isTutor, isStudent } from "../middleware/auth.js"
import upload from "../utils/fileUpload.js"

const router = express.Router()

// Student routes
router.post("/", auth, isStudent, upload.single("file"), createSubmission)
router.get("/student", auth, isStudent, getSubmissionsByStudent)

// Tutor routes
router.get("/tutor", auth, isTutor, getSubmissionsForTutor)
router.put("/:id/review", auth, isTutor, reviewSubmission)

// Common routes
router.get("/:id", auth, getSubmissionById)
router.get("/:id/download", auth, downloadSubmissionFile)

export default router
