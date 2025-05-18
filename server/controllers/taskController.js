import Task from "../models/Task.js"
import Roadmap from "../models/Roadmap.js"

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { roadmapId, title, description, dueDate, isDaily } = req.body
    const tutorId = req.user._id

    // Find roadmap
    const roadmap = await Roadmap.findById(roadmapId)

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" })
    }

    // Check if tutor is authorized
    if (roadmap.createdBy.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "You are not authorized to create tasks for this roadmap" })
    }

    // Create task
    const task = await Task.create({
      roadmapId,
      title,
      description,
      dueDate,
      isDaily: isDaily || false,
      createdBy: tutorId,
    })

    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get tasks by roadmap
export const getTasksByRoadmap = async (req, res) => {
  try {
    const { roadmapId } = req.params

    const tasks = await Task.find({ roadmapId }).sort({ dueDate: 1 })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, isDaily } = req.body
    const taskId = req.params.id
    const tutorId = req.user._id

    // Find task
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if tutor is authorized
    if (task.createdBy.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this task" })
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title: title || task.title,
        description: description || task.description,
        dueDate: dueDate || task.dueDate,
        isDaily: isDaily !== undefined ? isDaily : task.isDaily,
      },
      { new: true },
    )

    res.json(updatedTask)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id
    const tutorId = req.user._id

    // Find task
    const task = await Task.findById(taskId)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if tutor is authorized
    if (task.createdBy.toString() !== tutorId.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this task" })
    }

    // Delete task
    await Task.findByIdAndDelete(taskId)

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
