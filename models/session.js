const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    remainingTime: { type: Number, required: true },
    isPaused: { type: Boolean, required: true },
    currentQuestionIndex: { type: Number, default: 0 },
    selectedAnswers: { type: [[String]], default: [] },
    totalPoints: { type: Number, default: 0 },
    questionPoints: { type: [Number], default: [] },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
