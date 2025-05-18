import User from "../models/User.js"
import Batch from "../models/Batch.js"

// Get all users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params

    if (!["admin", "tutor", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const users = await User.find({ role }).select("-password").populate("batchId", "name")

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("batchId", "name")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, batchId } = req.body
    const userId = req.params.id

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Handle role change
    if (role && role !== user.role) {
      // If changing from tutor, remove from any batch they're tutoring
      if (user.role === "tutor") {
        await Batch.updateMany({ tutorId: userId }, { tutorId: null })
      }

      // If changing to tutor, ensure they're not in any batch as a student
      if (role === "tutor" && user.batchId) {
        await Batch.updateOne({ _id: user.batchId }, { $pull: { studentIds: userId } })
      }
    }

    // Handle batch change
    if (batchId !== undefined) {
      // If removing from batch
      if (batchId === null && user.batchId) {
        // If user is a tutor, remove from batch
        if (user.role === "tutor") {
          await Batch.updateOne({ tutorId: userId }, { tutorId: null })
        }

        // If user is a student, remove from batch's student list
        if (user.role === "student") {
          await Batch.updateOne({ _id: user.batchId }, { $pull: { studentIds: userId } })
        }
      }
      // If adding to a new batch
      else if (batchId) {
        const batch = await Batch.findById(batchId)
        if (!batch) {
          return res.status(404).json({ message: "Batch not found" })
        }

        // If user is a tutor
        if (user.role === "tutor" || role === "tutor") {
          // Remove from any existing batch they're tutoring
          await Batch.updateMany({ tutorId: userId }, { tutorId: null })

          // Assign as tutor to new batch
          await Batch.findByIdAndUpdate(batchId, { tutorId: userId })
        }

        // If user is a student
        if (user.role === "student" || role === "student") {
          // Remove from any existing batch they're in
          if (user.batchId) {
            await Batch.updateOne({ _id: user.batchId }, { $pull: { studentIds: userId } })
          }

          // Add to new batch's student list if not already there
          if (!batch.studentIds.includes(userId)) {
            await Batch.findByIdAndUpdate(batchId, {
              $push: { studentIds: userId },
            })
          }
        }
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
        batchId: batchId !== undefined ? batchId : user.batchId,
      },
      { new: true },
    )
      .select("-password")
      .populate("batchId", "name")

    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Find user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Handle batch relationships
    if (user.batchId) {
      // If user is a tutor, remove from batch
      if (user.role === "tutor") {
        await Batch.updateOne({ tutorId: userId }, { tutorId: null })
      }

      // If user is a student, remove from batch's student list
      if (user.role === "student") {
        await Batch.updateOne({ _id: user.batchId }, { $pull: { studentIds: userId } })
      }
    }

    // Delete user
    await User.findByIdAndDelete(userId)

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Get counts
    const totalBatches = await Batch.countDocuments()
    const totalTutors = await User.countDocuments({ role: "tutor" })
    const totalStudents = await User.countDocuments({ role: "student" })

    // Get top students
    const topStudents = await User.find({ role: "student" })
      .sort({ stars: -1 })
      .limit(10)
      .select("name email stars batchId")
      .populate("batchId", "name")

    // Format top students
    const formattedTopStudents = topStudents.map((student) => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      stars: student.stars,
      batchName: student.batchId ? student.batchId.name : "No Batch",
    }))

    // Return stats
    res.json({
      totalBatches,
      totalTutors,
      totalStudents,
      completionRate: 0, // This would be calculated from submissions
      topStudents: formattedTopStudents,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get tutor dashboard stats
export const getTutorStats = async (req, res) => {
  try {
    const tutorId = req.user._id

    // Get tutor's batch
    const batch = await Batch.findOne({ tutorId }).populate("studentIds", "name")

    if (!batch) {
      return res.json({
        batchName: "No Batch Assigned",
        totalStudents: 0,
        tasksCreated: 0,
        pendingSubmissions: 0,
        completionRate: 0,
        recentSubmissions: [],
      })
    }

    // Get student count
    const totalStudents = batch.studentIds.length

    // Return stats (placeholder for now)
    res.json({
      batchName: batch.name,
      totalStudents,
      tasksCreated: 0, // This would be calculated from tasks
      pendingSubmissions: 0, // This would be calculated from submissions
      completionRate: 0, // This would be calculated from submissions
      recentSubmissions: [], // This would be populated from submissions
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get student dashboard stats
export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id

    // Get student
    const student = await User.findById(studentId).populate("batchId", "name tutorId")

    if (!student.batchId) {
      return res.json({
        batchName: "No Batch Assigned",
        tutorName: "No Tutor Assigned",
        completedTasks: 0,
        pendingTasks: 0,
        stars: student.stars,
        rank: 0,
        dailyTasks: [],
        recentFeedback: [],
      })
    }

    // Get tutor name
    let tutorName = "No Tutor Assigned"
    if (student.batchId.tutorId) {
      const tutor = await User.findById(student.batchId.tutorId)
      if (tutor) {
        tutorName = tutor.name
      }
    }

    // Get student rank in batch
    const batchStudents = await User.find({
      batchId: student.batchId._id,
      role: "student",
    }).sort({ stars: -1 })

    const rank = batchStudents.findIndex((s) => s._id.toString() === studentId.toString()) + 1

    // Return stats (placeholder for now)
    res.json({
      batchName: student.batchId.name,
      tutorName,
      completedTasks: 0, // This would be calculated from submissions
      pendingTasks: 0, // This would be calculated from tasks
      stars: student.stars,
      rank,
      dailyTasks: [], // This would be populated from tasks
      recentFeedback: [], // This would be populated from submissions
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
