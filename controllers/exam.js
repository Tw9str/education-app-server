const Question = require("../models/question");
const Exam = require("../models/exam");
const { promisify } = require("util");
const { join } = require("path");
const fs = require("fs");

const getExams = async (req, res) => {
  try {
    const exams = await Exam.find();
    const examsWithQuestions = await Promise.all(
      exams.map(async (exam) => {
        const populatedExam = await Exam.populate(exam, {
          path: "questions",
          model: "Question",
        });

        const questionsCount = populatedExam.questions.length;

        return {
          ...populatedExam._doc,
          questionsCount: questionsCount,
        };
      })
    );
    res.json(examsWithQuestions);
  } catch (error) {
    console.error("Error fetching Exams:", error);
    res.status(500).json({ error: "Failed to fetch Exams" });
  }
};

const addExam = async (req, res) => {
  const { title, user, category } = req.body;

  let questionData;
  try {
    questionData = JSON.parse(req.body.questionsData);
  } catch (error) {
    return res.status(400).json({ error: "Invalid questionsData format" });
  }

  if (!title || !Array.isArray(questionData)) {
    return res
      .status(400)
      .json({ error: "Title and questionsData are required" });
  }

  try {
    const questions = await Promise.all(
      questionData.map(async (question, index) => {
        try {
          const newQuestion = new Question({
            image: req.files[index]?.filename || "",
            answers: question.answers,
            correctAnswers: question.correctAnswers,
            points: parseFloat(question.points),
            explanation: question.explanation,
          });
          return await newQuestion.save();
        } catch (error) {
          console.error(
            `Error saving question at index ${index}: ${error.message}`
          );
          throw new Error(`Error saving question at index ${index}`);
        }
      })
    );

    const newExam = new Exam({
      title,
      questions: questions.map((q) => q._id),
      category,
      user,
    });
    await newExam.save();
    res
      .status(201)
      .json({ newExam, message: "Exam will be availble in exams tab!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getExam = async (req, res) => {
  const { slug } = req.params;
  try {
    const exam = await Exam.findOne({ slug }).populate("questions");
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteFile = promisify(fs.unlink);

const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Find and delete images associated with questions
    for (const question of exam.questions) {
      if (question.image) {
        const imagePath = join(
          __dirname,
          "../public/questions",
          question.image
        );
        try {
          await deleteFile(imagePath);
        } catch (err) {
          console.error(`Failed to delete image ${imagePath}:`, err);
        }
      }
    }

    // Delete the questions related to the exam
    await Question.deleteMany({
      _id: { $in: exam.questions.map((q) => q._id) },
    });

    // Delete the exam
    await exam.deleteOne();

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error(err); // Added logging to aid in debugging
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getExams,
  addExam,
  getExam,
  deleteExam,
};
