const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    image: { type: String, required: true },
    answers: { type: [String], required: true },
    correctAnswers: { type: [String], required: true },
    points: { type: Number, min: 0, required: true },
    explanation: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
