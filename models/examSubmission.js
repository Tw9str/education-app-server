const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examSubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: { type: [[String]], required: true },
    points: { type: Number, required: true },
    questionPoints: { type: [Number], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamSubmission", examSubmissionSchema);
