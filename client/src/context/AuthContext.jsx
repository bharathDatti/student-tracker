"use client"

import { createContext, useState, useEffect } from "react"
import axios from "axios"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Set auth token header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Get user data
        const res = await axios.get("/api/auth/profile")
        setUser(res.data)
      } catch (err) {
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
        setError(err.response?.data?.message || "Authentication failed")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true)
      const res = await axios.post("/api/auth/login", { email, password })

      // Save token and set auth header
      localStorage.setItem("token", res.data.token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`

      setUser(res.data)
      setError(null)
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isTutor: user?.role === "tutor",
        isStudent: user?.role === "student",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
