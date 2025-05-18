import mongoose from "mongoose"

const doubtSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  reply: {
    type: String,
    default: "",
  },
})

const Doubt = mongoose.model("Doubt", doubtSchema)

export default Doubt
