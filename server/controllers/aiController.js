import User from "../models/User.js"
import Task from "../models/Task.js"
import Submission from "../models/Submission.js"
import mongoose from "mongoose" // Import mongoose to fix the undeclared variable error

// Simple AI suggestion logic (placeholder for real AI integration)
export const getAiSuggestions = async (req, res) => {
  try {
    const studentId = req.user._id

    // Get student data
    const student = await User.findById(studentId)

    if (!student.batchId) {
      return res.status(400).json({ message: "Student not assigned to any batch" })
    }

    // Get completed tasks
    const completedSubmissions = await Submission.find({
      studentId,
      isReviewed: true,
    }).populate("taskId")

    // Get all tasks for student's batch
    const tasks = await Task.find({
      roadmapId: { $in: await getRoadmapIdsForBatch(student.batchId) },
    }).sort({ dueDate: 1 })

    // Get pending tasks (not submitted)
    const completedTaskIds = completedSubmissions.map((sub) => sub.taskId._id.toString())
    const pendingTasks = tasks.filter((task) => !completedTaskIds.includes(task._id.toString()))

    // Calculate student performance
    const totalStars = completedSubmissions.reduce((sum, sub) => sum + sub.starsGiven, 0)
    const averageStars = completedSubmissions.length > 0 ? totalStars / completedSubmissions.length : 0

    // Generate suggestions based on performance
    const suggestions = []

    if (pendingTasks.length === 0) {
      suggestions.push({
        type: "achievement",
        message: "Congratulations! You've completed all assigned tasks.",
      })
    } else {
      // Suggest next task
      const nextTask = pendingTasks[0]
      suggestions.push({
        type: "next_task",
        message: `Focus on completing "${nextTask.title}" which is due on ${new Date(nextTask.dueDate).toLocaleDateString()}.`,
        taskId: nextTask._id,
      })

      // Add performance-based suggestions
      if (averageStars < 3 && completedSubmissions.length > 0) {
        suggestions.push({
          type: "improvement",
          message:
            "Your average rating is below 3 stars. Consider spending more time on task quality and reviewing feedback from previous submissions.",
        })
      } else if (averageStars >= 4 && completedSubmissions.length > 0) {
        suggestions.push({
          type: "excellence",
          message: "You're performing excellently with an average of 4+ stars! Keep up the good work.",
        })
      }

      // Add time management suggestion if there are multiple pending tasks
      if (pendingTasks.length > 1) {
        const urgentTasks = pendingTasks.filter(
          (task) => new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        )

        if (urgentTasks.length > 0) {
          suggestions.push({
            type: "time_management",
            message: `You have ${urgentTasks.length} task(s) due within the next 2 days. Prioritize these to avoid missing deadlines.`,
            urgentTasks: urgentTasks.map((task) => ({
              id: task._id,
              title: task.title,
              dueDate: task.dueDate,
            })),
          })
        }
      }
    }

    // Return suggestions
    res.json({
      studentName: student.name,
      completedTasks: completedSubmissions.length,
      pendingTasks: pendingTasks.length,
      averageStars,
      suggestions,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper function to get roadmap IDs for a batch
const getRoadmapIdsForBatch = async (batchId) => {
  const roadmaps = await mongoose.model("Roadmap").find({ batchId })
  return roadmaps.map((roadmap) => roadmap._id)
}
