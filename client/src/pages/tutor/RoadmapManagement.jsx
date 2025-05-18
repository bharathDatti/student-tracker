"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

const RoadmapManagement = () => {
  const { user } = useContext(AuthContext)
  const [roadmaps, setRoadmaps] = useState([])
  const [currentRoadmap, setCurrentRoadmap] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form states
  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    description: "",
  })
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    isDaily: false,
  })

  // Modal states
  const [showRoadmapModal, setShowRoadmapModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState(null)

  // Fetch roadmaps
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        if (!user.batchId) {
          setError("You are not assigned to any batch yet.")
          setLoading(false)
          return
        }

        const res = await axios.get(`/api/roadmaps/batch/${user.batchId}`)
        setRoadmaps(res.data)

        // If there's at least one roadmap, select it
        if (res.data.length > 0) {
          setCurrentRoadmap(res.data[0])
          fetchTasks(res.data[0]._id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        setError("Error loading roadmaps. Please try again.")
        setLoading(false)
      }
    }

    fetchRoadmaps()
  }, [user.batchId])

  // Fetch tasks for a roadmap
  const fetchTasks = async (roadmapId) => {
    try {
      const res = await axios.get(`/api/tasks/roadmap/${roadmapId}`)
      setTasks(res.data)
      setLoading(false)
    } catch (err) {
      setError("Error loading tasks. Please try again.")
      setLoading(false)
    }
  }

  // Handle roadmap form change
  const handleRoadmapFormChange = (e) => {
    const { name, value } = e.target
    setRoadmapForm({
      ...roadmapForm,
      [name]: value,
    })
  }

  // Handle task form change
  const handleTaskFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setTaskForm({
      ...taskForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Open roadmap modal
  const openRoadmapModal = (roadmap = null) => {
    if (roadmap) {
      setRoadmapForm({
        title: roadmap.title,
        description: roadmap.description,
      })
      setEditMode(true)
    } else {
      setRoadmapForm({
        title: "",
        description: "",
      })
      setEditMode(false)
    }
    setShowRoadmapModal(true)
  }

  // Open task modal
  const openTaskModal = (task = null) => {
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description,
        dueDate: new Date(task.dueDate).toISOString().split("T")[0],
        isDaily: task.isDaily,
      })
      setCurrentTaskId(task._id)
      setEditMode(true)
    } else {
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        isDaily: false,
      })
      setCurrentTaskId(null)
      setEditMode(false)
    }
    setShowTaskModal(true)
  }

  // Handle roadmap form submit
  const handleRoadmapSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode) {
        // Update roadmap
        const res = await axios.put(`/api/roadmaps/${currentRoadmap._id}`, roadmapForm)

        // Update roadmaps state
        setRoadmaps(roadmaps.map((r) => (r._id === currentRoadmap._id ? res.data : r)))
        setCurrentRoadmap(res.data)
      } else {
        // Create roadmap
        const res = await axios.post("/api/roadmaps", {
          ...roadmapForm,
          batchId: user.batchId,
        })

        // Update roadmaps state
        setRoadmaps([...roadmaps, res.data])

        // If this is the first roadmap, select it
        if (roadmaps.length === 0) {
          setCurrentRoadmap(res.data)
        }
      }

      // Close modal
      setShowRoadmapModal(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error saving roadmap. Please try again.")
    }
  }

  // Handle task form submit
  const handleTaskSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode) {
        // Update task
        const res = await axios.put(`/api/tasks/${currentTaskId}`, taskForm)

        // Update tasks state
        setTasks(tasks.map((t) => (t._id === currentTaskId ? res.data : t)))
      } else {
        // Create task
        const res = await axios.post("/api/tasks", {
          ...taskForm,
          roadmapId: currentRoadmap._id,
        })

        // Update tasks state
        setTasks([...tasks, res.data])
      }

      // Close modal
      setShowTaskModal(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task. Please try again.")
    }
  }

  // Handle roadmap selection
  const handleRoadmapSelect = (roadmap) => {
    setCurrentRoadmap(roadmap)
    fetchTasks(roadmap._id)
  }

  // Handle roadmap delete
  const handleRoadmapDelete = async (roadmapId) => {
    if (window.confirm("Are you sure you want to delete this roadmap? All associated tasks will also be deleted.")) {
      try {
        await axios.delete(`/api/roadmaps/${roadmapId}`)

        // Update roadmaps state
        const updatedRoadmaps = roadmaps.filter((r) => r._id !== roadmapId)
        setRoadmaps(updatedRoadmaps)

        // If the deleted roadmap was selected, select another one
        if (currentRoadmap._id === roadmapId) {
          if (updatedRoadmaps.length > 0) {
            setCurrentRoadmap(updatedRoadmaps[0])
            fetchTasks(updatedRoadmaps[0]._id)
          } else {
            setCurrentRoadmap(null)
            setTasks([])
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting roadmap. Please try again.")
      }
    }
  }

  // Handle task delete
  const handleTaskDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`/api/tasks/${taskId}`)

        // Update tasks state
        setTasks(tasks.filter((t) => t._id !== taskId))
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting task. Please try again.")
      }
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading roadmap data...</div>
  }

  if (!user.batchId) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        You are not assigned to any batch yet. Please contact an administrator.
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Roadmap Management</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Roadmap List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Roadmaps</h2>
            <button
              onClick={() => openRoadmapModal()}
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
            >
              Create New
            </button>
          </div>

          {roadmaps.length === 0 ? (
            <p className="text-gray-500">No roadmaps created yet.</p>
          ) : (
            <div className="space-y-2">
              {roadmaps.map((roadmap) => (
                <div
                  key={roadmap._id}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    currentRoadmap && currentRoadmap._id === roadmap._id
                      ? "bg-green-50 border-green-300"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleRoadmapSelect(roadmap)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{roadmap.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openRoadmapModal(roadmap)
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRoadmapDelete(roadmap._id)
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{roadmap.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Management */}
        <div className="md:col-span-3">
          {currentRoadmap ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{currentRoadmap.title}</h2>
                  <p className="text-gray-600 mt-1">{currentRoadmap.description}</p>
                </div>
                <button
                  onClick={() => openTaskModal()}
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                >
                  Add Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No tasks created for this roadmap yet.</p>
                  <button
                    onClick={() => openTaskModal()}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded"
                  >
                    Create First Task
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="mt-2 flex items-center space-x-3">
                            <span className="text-xs text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.isDaily && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Daily Task</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openTaskModal(task)}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTaskDelete(task._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <p className="text-gray-500 mb-4">No roadmap selected or created yet.</p>
              <button
                onClick={() => openRoadmapModal()}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Create Your First Roadmap
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editMode ? "Edit Roadmap" : "Create New Roadmap"}</h2>
                <button onClick={() => setShowRoadmapModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleRoadmapSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={roadmapForm.title}
                    onChange={handleRoadmapFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={roadmapForm.description}
                    onChange={handleRoadmapFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRoadmapModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editMode ? "Edit Task" : "Create New Task"}</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleTaskSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleTaskFormChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Daily Task</label>
                  <input
                    type="checkbox"
                    name="isDaily"
                    checked={taskForm.isDaily}
                    onChange={handleTaskFormChange}
                    className="form-checkbox h-4 w-4 text-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoadmapManagement
