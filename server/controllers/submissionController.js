import Submission from "../models/Submission.js"
import Task from "../models/Task.js"
import User from "../models/User.js"
import fs from "fs"
import path from "path"

// Create a new submission
export const createSubmission = async (req, res) => {
  try {
    const { taskId, content } = req.body
    const studentId = req.user._id

    // Check if task exists
    const task = await Task.findById(taskId)
    if (!task) {
      // If file was uploaded, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if student has already submitted this task
    const existingSubmission = await Submission.findOne({
      studentId,
      taskId,
    })

    if (existingSubmission) {
      // If file was uploaded, delete it
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(400).json({ message: "You have already submitted this task" })
    }

    // Create submission with file if uploaded
    const submissionData = {
      studentId,
      taskId,
      content,
    }

    if (req.file) {
      submissionData.fileUrl = `/uploads/${req.file.filename}`
      submissionData.fileName = req.file.originalname
      submissionData.fileType = req.file.mimetype
    }

    const submission = await Submission.create(submissionData)

    res.status(201).json(submission)
  } catch (error) {
    // If file was uploaded, delete it on error
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: error.message })
  }
}

// Get submissions by student
export const getSubmissionsByStudent = async (req, res) => {
  try {
    const studentId = req.user._id

    const submissions = await Submission.find({ studentId })
      .populate("taskId", "title description")
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get submissions for a tutor's batch
export const getSubmissionsForTutor = async (req, res) => {
  try {
    const tutorId = req.user._id

    // Get tutor's batch
    const tutor = await User.findById(tutorId)
    if (!tutor.batchId) {
      return res.json([])
    }

    // Get students in batch
    const students = await User.find({
      batchId: tutor.batchId,
      role: "student",
    })

    const studentIds = students.map((student) => student._id)

    // Get submissions from these students
    const submissions = await Submission.find({
      studentId: { $in: studentIds },
    })
      .populate("taskId", "title description")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 })

    res.json(submissions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Review submission
export const reviewSubmission = async (req, res) => {
  try {
    const { feedback, starsGiven } = req.body
    const submissionId = req.params.id

    // Validate stars
    if (starsGiven < 0 || starsGiven > 5) {
      return res.status(400).json({ message: "Stars must be between 0 and 5" })
    }

    // Find submission
    const submission = await Submission.findById(submissionId).populate("studentId", "stars")

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    // Update submission
    submission.feedback = feedback
    submission.starsGiven = starsGiven
    submission.isReviewed = true
    await submission.save()

    // Update student's stars
    await User.findByIdAndUpdate(submission.studentId._id, { stars: submission.studentId.stars + starsGiven })

    res.json(submission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get submission by ID
export const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("taskId", "title description")
      .populate("studentId", "name email")

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    res.json(submission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Download submission file
export const downloadSubmissionFile = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" })
    }

    if (!submission.fileUrl) {
      return res.status(404).json({ message: "No file attached to this submission" })
    }

    // Get file path
    const filePath = path.join(process.cwd(), submission.fileUrl.replace(/^\//, ""))

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" })
    }

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${submission.fileName}"`)
    res.setHeader("Content-Type", submission.fileType)

    // Stream file to response
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
