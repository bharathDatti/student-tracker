import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." })
  }
  next()
}

export const isTutor = (req, res, next) => {
  if (req.user.role !== "tutor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Tutor only." })
  }
  next()
}

export const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Access denied. Student only." })
  }
  next()
}
