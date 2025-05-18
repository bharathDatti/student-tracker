import mongoose from "mongoose"

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: "",
  },
  starsGiven: {
    type: Number,
    default: 0,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
})

const Submission = mongoose.model("Submission", submissionSchema)

export default Submission
