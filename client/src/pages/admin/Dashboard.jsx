"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalTutors: 0,
    totalStudents: 0,
    completionRate: 0,
    topStudents: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/users/admin/stats")
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Batches</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalBatches}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Tutors</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalTutors}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Students</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Task Completion Rate</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.completionRate}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Top Performing Students</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stars
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topStudents.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.batchName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">⭐ {student.stars}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.tasksCompleted}</div>
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

export default AdminDashboard
