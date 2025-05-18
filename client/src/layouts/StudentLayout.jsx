"use client"

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"

const StudentLayout = () => {
  const { logout, user } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navigation = [
    { name: "Dashboard", href: "/student" },
    { name: "Roadmap", href: "/student/roadmap" },
    { name: "Ask Doubt", href: "/student/ask-doubt" },
    { name: "Notifications", href: "/student/notifications" },
    { name: "Leaderboard", href: "/student/leaderboard" },
    { name: "AI Suggestions", href: "/student/ai-suggestions" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white font-bold text-xl">Task Tracker</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${location.pathname === item.href ? "bg-blue-700 text-white" : "text-white hover:bg-blue-500"} px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <div className="text-white mr-4">
                  <span className="mr-2">{user?.name} (Student)</span>
                  <span className="bg-yellow-400 text-blue-800 px-2 py-1 rounded-full text-xs">
                    ⭐ {user?.stars || 0}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 p-1 rounded-full text-white hover:bg-blue-800 focus:outline-none"
                >
                  <span className="px-2 py-1">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default StudentLayout
