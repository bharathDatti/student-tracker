"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const AiSuggestions = () => {
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get("/api/ai/suggestions")
        setSuggestions(res.data)
        setLoading(false)
      } catch (err) {
        setError("Error loading AI suggestions. Please try again.")
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  if (loading) {
    return <div className="text-center py-10">Loading AI suggestions...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">AI Learning Assistant</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Hello, {suggestions.studentName}!</h2>
            <p className="text-gray-600">Here are your personalized learning suggestions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-1">Completed Tasks</h3>
            <p className="text-2xl font-bold text-blue-600">{suggestions.completedTasks}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h3 className="font-medium text-yellow-800 mb-1">Average Stars</h3>
            <p className="text-2xl font-bold text-yellow-600">⭐ {suggestions.averageStars.toFixed(1)}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-medium text-green-800 mb-1">Pending Tasks</h3>
            <p className="text-2xl font-bold text-green-600">{suggestions.pendingTasks}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-lg border-b pb-2">Personalized Suggestions</h3>

          {suggestions.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                suggestion.type === "next_task"
                  ? "bg-blue-50 border-blue-200"
                  : suggestion.type === "improvement"
                    ? "bg-yellow-50 border-yellow-200"
                    : suggestion.type === "time_management"
                      ? "bg-red-50 border-red-200"
                      : suggestion.type === "excellence"
                        ? "bg-green-50 border-green-200"
                        : "bg-purple-50 border-purple-200"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`p-2 rounded-full mr-3 ${
                    suggestion.type === "next_task"
                      ? "bg-blue-100 text-blue-600"
                      : suggestion.type === "improvement"
                        ? "bg-yellow-100 text-yellow-600"
                        : suggestion.type === "time_management"
                          ? "bg-red-100 text-red-600"
                          : suggestion.type === "excellence"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {suggestion.type === "next_task" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {suggestion.type === "improvement" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {suggestion.type === "time_management" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {suggestion.type === "excellence" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  {suggestion.type === "achievement" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-gray-800">{suggestion.message}</p>

                  {suggestion.type === "next_task" && suggestion.taskId && (
                    <div className="mt-2">
                      <Link
                        to={`/student/submit-task/${suggestion.taskId}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded inline-block"
                      >
                        Start Task
                      </Link>
                    </div>
                  )}

                  {suggestion.type === "time_management" && suggestion.urgentTasks && (
                    <div className="mt-2 space-y-1">
                      {suggestion.urgentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex justify-between items-center bg-white p-2 rounded border border-red-100"
                        >
                          <span className="text-sm">{task.title}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-red-600 mr-2">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <Link
                              to={`/student/submit-task/${task.id}`}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                            >
                              Submit
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> These suggestions are generated based on your current progress and performance. The AI
          assistant analyzes your completed tasks, submission quality, and upcoming deadlines to provide personalized
          recommendations to help you succeed in your learning journey.
        </p>
      </div>
    </div>
  )
}

export default AiSuggestions
