"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const TutorDashboard = () => {
  const [stats, setStats] = useState({
    batchName: "",
    totalStudents: 0,
    tasksCreated: 0,
    pendingSubmissions: 0,
    completionRate: 0,
    recentSubmissions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/users/tutor/stats")
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
      <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Batch: {stats.batchName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Students</h2>
          <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Tasks Created</h2>
          <p className="text-3xl font-bold text-green-600">{stats.tasksCreated}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Pending Submissions</h2>
          <p className="text-3xl font-bold text-green-600">{stats.pendingSubmissions}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Completion Rate</h2>
          <p className="text-3xl font-bold text-green-600">{stats.completionRate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentSubmissions.map((submission) => (
                <tr key={submission._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{submission.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.taskTitle}</div>
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
                      {submission.isReviewed ? "Reviewed" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TutorDashboard
