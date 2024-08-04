const Exam = require("../models/exam");
const User = require("../models/user");
const Session = require("../models/session");
const ExamSubmission = require("../models/examSubmission");

const storeSession = async (req, res) => {
  const {
    userId,
    examId,
    remainingTime,
    isPaused,
    currentQuestionIndex,
    selectedAnswers,
    totalPoints,
    questionPoints,
  } = req.body;

  try {
    const session = await Session.findOneAndUpdate(
      { userId, examId },
      {
        remainingTime,
        isPaused,
        lastUpdated: Date.now(),
        currentQuestionIndex,
        selectedAnswers,
        totalPoints,
        questionPoints,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, session });
  } catch (error) {
    console.error("Error saving session state:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getSession = async (req, res) => {
  const { userId, examId } = req.query;

  try {
    const session = await Session.findOne({ userId, examId });

    if (session) {
      res.json(session);
    } else {
      res.json(null); // No session found
    }
  } catch (error) {
    console.error("Error fetching session state:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const submitExam = async (req, res) => {
  try {
    const { userId, examId, answers, points, questionPoints } = req.body;

    // Find the user and exam
    const user = await User.findById(userId);
    const exam = await Exam.findById(examId);

    if (!user || !exam) {
      return res.status(404).json({ message: "User or Exam not found" });
    }

    // Save the submitted exam to the ExamSubmission collection
    const examSubmission = new ExamSubmission({
      user: userId,
      exam: examId,
      answers: answers,
      points: points,
      questionPoints: questionPoints,
    });

    await examSubmission.save();

    // Clear the session data
    await Session.findOneAndDelete({ userId, examId });

    // Return the submission result
    res
      .status(200)
      .json({ message: "Answers submitted successfully", examSubmission });
  } catch (error) {
    res.status(500).json({ message: "Error submitting answers", error });
  }
};

module.exports = { storeSession, getSession, submitExam };
