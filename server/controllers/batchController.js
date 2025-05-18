import Batch from "../models/Batch.js"
import User from "../models/User.js"

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    const { name, tutorId, studentIds } = req.body

    // Validate tutor exists and is a tutor
    if (tutorId) {
      const tutor = await User.findById(tutorId)
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" })
      }
      if (tutor.role !== "tutor") {
        return res.status(400).json({ message: "Selected user is not a tutor" })
      }
    }

    // Create the batch
    const batch = await Batch.create({
      name,
      tutorId: tutorId || null,
      studentIds: studentIds || [],
    })

    // Update tutor's batchId if provided
    if (tutorId) {
      await User.findByIdAndUpdate(tutorId, { batchId: batch._id })
    }

    // Update students' batchId if provided
    if (studentIds && studentIds.length > 0) {
      await User.updateMany({ _id: { $in: studentIds } }, { batchId: batch._id })
    }

    res.status(201).json(batch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all batches
export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate("tutorId", "name email").populate("studentIds", "name email")

    res.json(batches)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get batch by ID
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("tutorId", "name email")
      .populate("studentIds", "name email")

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    res.json(batch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update batch
export const updateBatch = async (req, res) => {
  try {
    const { name, tutorId, studentIds } = req.body
    const batchId = req.params.id

    // Find the batch
    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // If tutor is being changed
    if (tutorId && tutorId !== batch.tutorId.toString()) {
      // Validate new tutor
      const newTutor = await User.findById(tutorId)
      if (!newTutor) {
        return res.status(404).json({ message: "Tutor not found" })
      }
      if (newTutor.role !== "tutor") {
        return res.status(400).json({ message: "Selected user is not a tutor" })
      }

      // Remove batch from old tutor if exists
      if (batch.tutorId) {
        await User.findByIdAndUpdate(batch.tutorId, { batchId: null })
      }

      // Assign batch to new tutor
      await User.findByIdAndUpdate(tutorId, { batchId: batchId })
    }

    // Handle student changes if provided
    if (studentIds) {
      // Get current students
      const currentStudentIds = batch.studentIds.map((id) => id.toString())

      // Find students to remove (in current but not in new list)
      const studentsToRemove = currentStudentIds.filter((id) => !studentIds.includes(id))

      // Find students to add (in new list but not in current)
      const studentsToAdd = studentIds.filter((id) => !currentStudentIds.includes(id))

      // Remove batch from students being removed
      if (studentsToRemove.length > 0) {
        await User.updateMany({ _id: { $in: studentsToRemove } }, { batchId: null })
      }

      // Add batch to new students
      if (studentsToAdd.length > 0) {
        await User.updateMany({ _id: { $in: studentsToAdd } }, { batchId: batchId })
      }
    }

    // Update the batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      {
        name: name || batch.name,
        tutorId: tutorId || batch.tutorId,
        studentIds: studentIds || batch.studentIds,
      },
      { new: true },
    )
      .populate("tutorId", "name email")
      .populate("studentIds", "name email")

    res.json(updatedBatch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete batch
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // Remove batch reference from tutor
    if (batch.tutorId) {
      await User.findByIdAndUpdate(batch.tutorId, { batchId: null })
    }

    // Remove batch reference from all students
    if (batch.studentIds.length > 0) {
      await User.updateMany({ _id: { $in: batch.studentIds } }, { batchId: null })
    }

    // Delete the batch
    await Batch.findByIdAndDelete(req.params.id)

    res.json({ message: "Batch deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add student to batch
export const addStudentToBatch = async (req, res) => {
  try {
    const { studentId } = req.body
    const batchId = req.params.id

    // Validate batch exists
    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // Validate student exists and is a student
    const student = await User.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }
    if (student.role !== "student") {
      return res.status(400).json({ message: "Selected user is not a student" })
    }

    // Check if student is already in the batch
    if (batch.studentIds.includes(studentId)) {
      return res.status(400).json({ message: "Student already in batch" })
    }

    // Add student to batch
    batch.studentIds.push(studentId)
    await batch.save()

    // Update student's batchId
    await User.findByIdAndUpdate(studentId, { batchId })

    res.json(batch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Remove student from batch
export const removeStudentFromBatch = async (req, res) => {
  try {
    const { studentId } = req.params
    const batchId = req.params.id

    // Validate batch exists
    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // Check if student is in the batch
    if (!batch.studentIds.includes(studentId)) {
      return res.status(400).json({ message: "Student not in batch" })
    }

    // Remove student from batch
    batch.studentIds = batch.studentIds.filter((id) => id.toString() !== studentId)
    await batch.save()

    // Update student's batchId
    await User.findByIdAndUpdate(studentId, { batchId: null })

    res.json(batch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Assign tutor to batch
export const assignTutorToBatch = async (req, res) => {
  try {
    const { tutorId } = req.body
    const batchId = req.params.id

    // Validate batch exists
    const batch = await Batch.findById(batchId)
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // Validate tutor exists and is a tutor
    const tutor = await User.findById(tutorId)
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" })
    }
    if (tutor.role !== "tutor") {
      return res.status(400).json({ message: "Selected user is not a tutor" })
    }

    // If batch already has a tutor, remove batch from old tutor
    if (batch.tutorId) {
      await User.findByIdAndUpdate(batch.tutorId, { batchId: null })
    }

    // Assign tutor to batch
    batch.tutorId = tutorId
    await batch.save()

    // Update tutor's batchId
    await User.findByIdAndUpdate(tutorId, { batchId })

    res.json(batch)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get batch statistics
export const getBatchStats = async (req, res) => {
  try {
    const batchId = req.params.id

    // Validate batch exists
    const batch = await Batch.findById(batchId)
      .populate("tutorId", "name email")
      .populate("studentIds", "name email stars")

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" })
    }

    // Get basic stats
    const stats = {
      batchName: batch.name,
      tutorName: batch.tutorId ? batch.tutorId.name : "No tutor assigned",
      studentCount: batch.studentIds.length,
      averageStars: 0,
      topStudents: [],
    }

    // Calculate average stars
    if (batch.studentIds.length > 0) {
      const totalStars = batch.studentIds.reduce((sum, student) => sum + student.stars, 0)
      stats.averageStars = totalStars / batch.studentIds.length
    }

    // Get top 5 students by stars
    stats.topStudents = batch.studentIds
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5)
      .map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email,
        stars: student.stars,
      }))

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
