"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const ReviewSubmissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSubmission, setCurrentSubmission] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [stars, setStars] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState("pending") // pending, reviewed, all

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/api/submissions/tutor")
        setSubmissions(res.data)
        setLoading(false)
      } catch (err) {
        setError("Error loading submissions. Please try again.")
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === "all") return true
    if (filter === "pending") return !submission.isReviewed
    if (filter === "reviewed") return submission.isReviewed
    return true
  })

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault()

    if (!feedback.trim()) {
      setError("Please enter feedback")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const res = await axios.put(`/api/submissions/${currentSubmission._id}/review`, {
        feedback,
        starsGiven: stars,
      })

      // Update submissions list
      setSubmissions(submissions.map((sub) => (sub._id === currentSubmission._id ? res.data : sub)))

      // Reset form
      setCurrentSubmission(null)
      setFeedback("")
      setStars(0)
      setSubmitting(false)
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting review. Please try again.")
      setSubmitting(false)
    }
  }

  // Open review form
  const openReviewForm = (submission) => {
    setCurrentSubmission(submission)
    setFeedback(submission.feedback || "")
    setStars(submission.starsGiven || 0)
  }

  // Close review form
  const closeReviewForm = () => {
    setCurrentSubmission(null)
    setFeedback("")
    setStars(0)
  }

  // Handle file download
  const handleDownload = async (submissionId) => {
    try {
      window.open(`/api/submissions/${submissionId}/download`, "_blank")
    } catch (err) {
      setError("Error downloading file. Please try again.")
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading submissions...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review Submissions</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Student Submissions</h2>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-sm ${
                filter === "all" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded text-sm ${
                filter === "pending" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("reviewed")}
              className={`px-3 py-1 rounded text-sm ${
                filter === "reviewed" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
            >
              Reviewed
            </button>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <p className="text-gray-500">No submissions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{submission.studentId.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.taskId.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.isReviewed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.isReviewed ? <>Reviewed (⭐ {submission.starsGiven})</> : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.fileUrl ? (
                        <button
                          onClick={() => handleDownload(submission._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          {submission.fileName || "Download"}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openReviewForm(submission)}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                      >
                        {submission.isReviewed ? "Edit Review" : "Review"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {currentSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Review Submission</h2>
                <button onClick={closeReviewForm} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium">Task: {currentSubmission.taskId.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{currentSubmission.taskId.description}</p>
              </div>

              <div className="mb-4">
                <h3 className="font-medium">Student: {currentSubmission.studentId.name}</h3>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(currentSubmission.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Submission Content:</h3>
                <p className="text-sm whitespace-pre-wrap">{currentSubmission.content}</p>
              </div>

              {currentSubmission.fileUrl && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Attached File:</h3>
                  <div className="flex items-center p-3 bg-blue-50 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{currentSubmission.fileName}</span>
                    <button
                      onClick={() => handleDownload(currentSubmission._id)}
                      className="ml-auto text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Your Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                    placeholder="Enter your feedback for the student..."
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Stars (0-5)</label>
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStars(value)}
                        className={`w-10 h-10 rounded-full ${
                          stars >= value ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeReviewForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
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

export default ReviewSubmissions
