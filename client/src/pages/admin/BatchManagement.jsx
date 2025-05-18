"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const BatchManagement = () => {
  const [batches, setBatches] = useState([])
  const [tutors, setTutors] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    tutorId: "",
    studentIds: [],
  })

  // Edit mode
  const [editMode, setEditMode] = useState(false)
  const [currentBatchId, setCurrentBatchId] = useState(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch batches
        const batchesRes = await axios.get("/api/batches")
        setBatches(batchesRes.data)

        // Fetch tutors
        const tutorsRes = await axios.get("/api/users/role/tutor")
        setTutors(tutorsRes.data)

        // Fetch students
        const studentsRes = await axios.get("/api/users/role/student")
        setStudents(studentsRes.data)

        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle student selection
  const handleStudentSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData({
      ...formData,
      studentIds: selectedOptions,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editMode) {
        // Update batch
        const res = await axios.put(`/api/batches/${currentBatchId}`, formData)

        // Update batches state
        setBatches(batches.map((batch) => (batch._id === currentBatchId ? res.data : batch)))

        // Reset form
        setEditMode(false)
        setCurrentBatchId(null)
      } else {
        // Create batch
        const res = await axios.post("/api/batches", formData)

        // Update batches state
        setBatches([...batches, res.data])
      }

      // Clear form
      setFormData({
        name: "",
        tutorId: "",
        studentIds: [],
      })
    } catch (err) {
      setError(err.response?.data?.message || "Error saving batch")
    }
  }

  // Handle edit batch
  const handleEdit = (batch) => {
    setFormData({
      name: batch.name,
      tutorId: batch.tutorId?._id || "",
      studentIds: batch.studentIds.map((student) => student._id),
    })
    setEditMode(true)
    setCurrentBatchId(batch._id)
  }

  // Handle delete batch
  const handleDelete = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await axios.delete(`/api/batches/${batchId}`)

        // Update batches state
        setBatches(batches.filter((batch) => batch._id !== batchId))
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting batch")
      }
    }
  }

  // Cancel edit
  const handleCancel = () => {
    setFormData({
      name: "",
      tutorId: "",
      studentIds: [],
    })
    setEditMode(false)
    setCurrentBatchId(null)
  }

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Batch Management</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batch Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{editMode ? "Edit Batch" : "Create New Batch"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Batch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Assign Tutor</label>
              <select
                name="tutorId"
                value={formData.tutorId}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select Tutor (Optional)</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.name} ({tutor.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Assign Students</label>
              <select
                multiple
                name="studentIds"
                value={formData.studentIds}
                onChange={handleStudentSelection}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
              >
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple students</p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {editMode ? "Update Batch" : "Create Batch"}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Batch List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Batches</h2>

          {batches.length === 0 ? (
            <p className="text-gray-500">No batches created yet.</p>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div key={batch._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{batch.name}</h3>
                      <p className="text-sm text-gray-600">Tutor: {batch.tutorId ? batch.tutorId.name : "None"}</p>
                      <p className="text-sm text-gray-600">Students: {batch.studentIds.length}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(batch)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(batch._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {batch.studentIds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Students:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {batch.studentIds.map((student) => (
                          <span key={student._id} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {student.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BatchManagement
