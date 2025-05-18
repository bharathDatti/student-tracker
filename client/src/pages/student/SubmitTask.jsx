"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

const SubmitTask = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [content, setContent] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`)
        setTask(res.data)
        setLoading(false)
      } catch (err) {
        setError("Error loading task. Please try again.")
        setLoading(false)
      }
    }

    fetchTask()
  }, [taskId])

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit")
        e.target.value = null
        return
      }
      setFile(selectedFile)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Please enter your submission content")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Create form data for file upload
      const formData = new FormData()
      formData.append("taskId", taskId)
      formData.append("content", content)

      if (file) {
        formData.append("file", file)
      }

      await axios.post("/api/submissions", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccess(true)
      setSubmitting(false)

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/student")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting task. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading task details...</div>
  }

  if (!task) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Task not found. Please go back and try again.
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Submit Task</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
        <p className="text-gray-600 mb-4">{task.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-4">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          {task.isDaily && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Daily Task</span>}
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Task submitted successfully! Redirecting to dashboard...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Your Submission</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
              placeholder="Enter your solution or answer here..."
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Attachment (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: Images, PDF, Word, Excel, ZIP, Text (Max: 10MB)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Task"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/student/roadmap")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default SubmitTask
