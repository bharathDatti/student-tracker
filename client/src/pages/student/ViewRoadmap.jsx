"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const ViewRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [tasks, setTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all") // all, daily, pending, completed

  useEffect(() => {
    const fetchRoadmapData = async () => {
      try {
        // Get student's batch
        const studentRes = await axios.get("/api/auth/profile")

        if (!studentRes.data.batchId) {
          setError("You are not assigned to any batch yet.")
          setLoading(false)
          return
        }

        // Get roadmap for batch
        const roadmapsRes = await axios.get(`/api/roadmaps/batch/${studentRes.data.batchId}`)

        if (roadmapsRes.data.length === 0) {
          setError("No roadmap has been created for your batch yet.")
          setLoading(false)
          return
        }

        // Get the first roadmap (assuming one roadmap per batch)
        setRoadmap(roadmapsRes.data[0])

        // Get tasks for roadmap
        const tasksRes = await axios.get(`/api/tasks/roadmap/${roadmapsRes.data[0]._id}`)
        setTasks(tasksRes.data)

        // Get student's submissions
        const submissionsRes = await axios.get("/api/submissions/student")
        setSubmissions(submissionsRes.data)

        setLoading(false)
      } catch (err) {
        setError("Error loading roadmap. Please try again.")
        setLoading(false)
      }
    }

    fetchRoadmapData()
  }, [])

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    // Check if task is completed
    const isCompleted = submissions.some((sub) => sub.taskId._id === task._id)

    // Check if task is daily
    const isDaily = task.isDaily

    // Check if task is pending (not completed and due date not passed)
    const isPending = !isCompleted && new Date(task.dueDate) >= new Date()

    // Filter based on active tab
    if (activeTab === "all") return true
    if (activeTab === "daily") return isDaily
    if (activeTab === "pending") return isPending
    if (activeTab === "completed") return isCompleted

    return true
  })

  // Check if task is completed
  const isTaskCompleted = (taskId) => {
    return submissions.some((sub) => sub.taskId._id === taskId)
  }

  // Get submission for a task
  const getSubmission = (taskId) => {
    return submissions.find((sub) => sub.taskId._id === taskId)
  }

  if (loading) {
    return <div className="text-center py-10">Loading roadmap...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Learning Roadmap</h1>

      {roadmap && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">{roadmap.title}</h2>
          <p className="text-gray-600 mb-4">{roadmap.description}</p>
          <div className="text-sm text-gray-500">Created by: {roadmap.createdBy.name}</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "all" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "daily" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Daily Tasks
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "pending"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "completed"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Completed
            </button>
          </nav>
        </div>

        <div className="p-6">
          {filteredTasks.length === 0 ? (
            <p className="text-gray-500">No tasks found for this filter.</p>
          ) : (
            <div className="space-y-6">
              {filteredTasks.map((task) => {
                const completed = isTaskCompleted(task._id)
                const submission = completed ? getSubmission(task._id) : null
                const isPastDue = new Date(task.dueDate) < new Date() && !completed

                return (
                  <div
                    key={task._id}
                    className={`border rounded-lg p-4 ${
                      completed
                        ? "border-green-200 bg-green-50"
                        : isPastDue
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200"
                    }`}
                  >
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
                          {completed && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Completed</span>
                          )}
                          {isPastDue && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Past Due</span>
                          )}
                        </div>
                      </div>

                      <div>
                        {completed ? (
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                            {submission.isReviewed && (
                              <div className="text-yellow-500 mt-1">⭐ {submission.starsGiven}</div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={`/student/submit-task/${task._id}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                          >
                            Submit
                          </Link>
                        )}
                      </div>
                    </div>

                    {completed && submission.isReviewed && (
                      <div className="mt-3 p-3 bg-white rounded border border-green-200">
                        <h4 className="text-sm font-medium text-gray-700">Feedback:</h4>
                        <p className="text-sm text-gray-600 mt-1">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewRoadmap
