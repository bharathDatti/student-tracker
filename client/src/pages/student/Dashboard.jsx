"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    batchName: "",
    tutorName: "",
    completedTasks: 0,
    pendingTasks: 0,
    stars: 0,
    rank: 0,
    dailyTasks: [],
    recentFeedback: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/users/student/stats")
        setStats(res.data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-center py-10">Loading dashboard data...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Batch: {stats.batchName}</h2>
        <p className="text-gray-600">Tutor: {stats.tutorName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Completed Tasks</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.completedTasks}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Pending Tasks</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.pendingTasks}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Stars Earned</h2>
          <p className="text-3xl font-bold text-blue-600">⭐ {stats.stars}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Batch Rank</h2>
          <p className="text-3xl font-bold text-blue-600">#{stats.rank}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Today's Tasks</h2>

          {stats.dailyTasks.length === 0 ? (
            <p className="text-gray-500">No tasks for today!</p>
          ) : (
            <div className="space-y-4">
              {stats.dailyTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <Link
                      to={`/student/submit-task/${task._id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                    >
                      Submit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>

          {stats.recentFeedback.length === 0 ? (
            <p className="text-gray-500">No feedback yet!</p>
          ) : (
            <div className="space-y-4">
              {stats.recentFeedback.map((feedback) => (
                <div key={feedback._id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{feedback.taskTitle}</h3>
                    <span className="text-yellow-500">⭐ {feedback.starsGiven}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{feedback.feedback}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(feedback.reviewedAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
