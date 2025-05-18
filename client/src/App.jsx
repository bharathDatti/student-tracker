"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { useContext } from "react"
import { AuthContext } from "./context/AuthContext"

// Layouts
import AdminLayout from "./layouts/AdminLayout"
import TutorLayout from "./layouts/TutorLayout"
import StudentLayout from "./layouts/StudentLayout"

// Pages
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard"
import TutorManagement from "./pages/admin/TutorManagement"
import StudentManagement from "./pages/admin/StudentManagement"
import BatchManagement from "./pages/admin/BatchManagement"
import Notifications from "./pages/admin/Notifications"

// Tutor Pages
import TutorDashboard from "./pages/tutor/Dashboard"
import BatchStudents from "./pages/tutor/BatchStudents"
import RoadmapManagement from "./pages/tutor/RoadmapManagement"
import TaskManagement from "./pages/tutor/TaskManagement"
import ReviewSubmissions from "./pages/tutor/ReviewSubmissions"
import ReplyDoubts from "./pages/tutor/ReplyDoubts"

// Student Pages
import StudentDashboard from "./pages/student/Dashboard"
import ViewRoadmap from "./pages/student/ViewRoadmap"
import SubmitTask from "./pages/student/SubmitTask"
import AskDoubt from "./pages/student/AskDoubt"
import ViewNotifications from "./pages/student/ViewNotifications"
import Leaderboard from "./pages/student/Leaderboard"
import AiSuggestions from "./pages/student/AiSuggestions"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

// App Component
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tutors" element={<TutorManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="batches" element={<BatchManagement />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Tutor Routes */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={["tutor"]}>
              <TutorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TutorDashboard />} />
          <Route path="students" element={<BatchStudents />} />
          <Route path="roadmaps" element={<RoadmapManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="submissions" element={<ReviewSubmissions />} />
          <Route path="doubts" element={<ReplyDoubts />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="roadmap" element={<ViewRoadmap />} />
          <Route path="submit-task/:taskId" element={<SubmitTask />} />
          <Route path="ask-doubt" element={<AskDoubt />} />
          <Route path="notifications" element={<ViewNotifications />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="ai-suggestions" element={<AiSuggestions />} />
        </Route>

        {/* Redirect based on role */}
        <Route path="/" element={<RoleBasedRedirect />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

// Redirect based on user role
const RoleBasedRedirect = () => {
  const { user, loading, isAuthenticated } = useContext(AuthContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" />
    case "tutor":
      return <Navigate to="/tutor" />
    case "student":
      return <Navigate to="/student" />
    default:
      return <Navigate to="/login" />
  }
}

// Main App with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
