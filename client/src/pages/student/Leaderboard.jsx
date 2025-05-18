"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

const Leaderboard = () => {
  const { user } = useContext(AuthContext)
  const [leaderboard, setLeaderboard] = useState([])
  const [batchInfo, setBatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get student's batch
        const studentRes = await axios.get(`/api/users/${user._id}`)

        if (!studentRes.data.batchId) {
          setError("You are not assigned to any batch yet.")
          setLoading(false)
          return
        }

        // Get batch details and stats
        const batchRes = await axios.get(`/api/batches/${studentRes.data.batchId._id}/stats`)
        setBatchInfo(batchRes.data)

        // Get all students in batch
        const batchDetailsRes = await axios.get(`/api/batches/${studentRes.data.batchId._id}`)

        // Map and sort students by stars
        const students = batchDetailsRes.data.studentIds
          .map((student) => ({
            id: student._id,
            name: student.name,
            email: student.email,
            stars: student.stars || 0,
            isCurrentUser: student._id === user._id,
          }))
          .sort((a, b) => b.stars - a.stars)
          .map((student, index) => ({
            ...student,
            rank: index + 1,
          }))

        setLeaderboard(students)
        setLoading(false)
      } catch (err) {
        setError("Error loading leaderboard. Please try again.")
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [user._id])

  if (loading) {
    return <div className="text-center py-10">Loading leaderboard...</div>
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Batch Leaderboard</h1>

      {batchInfo && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-2">Batch: {batchInfo.batchName}</h2>
          <p className="text-gray-600">Tutor: {batchInfo.tutorName}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="mr-4">Students: {batchInfo.studentCount}</span>
            <span>Average Stars: ⭐ {batchInfo.averageStars.toFixed(1)}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stars</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((student) => (
              <tr key={student.id} className={student.isCurrentUser ? "bg-blue-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.rank === 1
                      ? "🥇"
                      : student.rank === 2
                        ? "🥈"
                        : student.rank === 3
                          ? "🥉"
                          : `#${student.rank}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name} {student.isCurrentUser && "(You)"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-yellow-500 font-bold">⭐ {student.stars}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">How to Earn Stars</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Complete and submit daily tasks</li>
          <li>Receive good feedback from your tutor</li>
          <li>Help other students with their doubts</li>
          <li>Consistently meet deadlines</li>
        </ul>
      </div>
    </div>
  )
}

export default Leaderboard
