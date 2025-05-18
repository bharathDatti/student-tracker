import Roadmap from "../models/Roadmap.js"
import Task from "../models/Task.js"
import User from "../models/User.js"

// Create a new roadmap
export const createRoadmap = async (req, res) => {
  try {
    const { batchId, title, description } = req.body
    const tutorId = req.user._id

    // Validate tutor is assigned to this batch
    const tutor = await User.findById(tutorId)
    if (!tutor.batchId || tutor.batchId.toString() !== batchId) {
      return res.status(403).json({ message: "You are not authorized to create a roadmap for this batch" })
    }

    // Create roadmap
    const roadmap = await Roadmap.create({
      batchId,
      title,
      description,
      createdBy: tutorId,
    })

    res.status(201).json(roadmap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get roadmaps by batch
export const getRoadmapsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params

    const roadmaps = await Roadmap.find({ batchId }).populate("createdBy", "name")

    res.json(roadmaps)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get roadmap by ID
export const getRoadmapById = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id).populate("createdBy", "name")

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    res.json(roadmap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update roadmap
export const updateRoadmap = async (req, res) => {
  try {
    const { title, description } = req.body
    const roadmapId = req.params.id
    const tutorId = req.user._id

    // Find roadmap
    const roadmap = await Roadmap.findById(roadmapId)

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    // Check if tutor is authorized
    if (roadmap.createdBy.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this roadmap" })
    }

    // Update roadmap
    const updatedRoadmap = await Roadmap.findByIdAndUpdate(
      roadmapId,
      {
        title: title || roadmap.title,
        description: description || roadmap.description,
      },
      { new: true },
    ).populate("createdBy", "name")

    res.json(updatedRoadmap)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete roadmap
export const deleteRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id
    const tutorId = req.user._id

    // Find roadmap
    const roadmap = await Roadmap.findById(roadmapId)

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    // Check if tutor is authorized
    if (roadmap.createdBy.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this roadmap" })
    }

    // Delete associated tasks
    await Task.deleteMany({ roadmapId })

    // Delete roadmap
    await Roadmap.findByIdAndDelete(roadmapId)

    res.json({ message: "Roadmap and associated tasks deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get roadmap with tasks
export const getRoadmapWithTasks = async (req, res) => {
  try {
    const roadmapId = req.params.id

    // Find roadmap
    const roadmap = await Roadmap.findById(roadmapId).populate("createdBy", "name")

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    // Find tasks
    const tasks = await Task.find({ roadmapId }).sort({ dueDate: 1 })

    res.json({
      roadmap,
      tasks,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
