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

const getCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).send({ message: err.message });
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
            correctAnswer: question.correctAnswer,
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

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const Category = await Category.findById(id);
    if (!Category) {
      return res.status(404).json({ message: "Category not found" });
    }
    for (const image of Category.imagesPath) {
      const imagePath = join(__dirname, "../../client/public/images", image);
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
      }
    }
    await Category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getExams,
  getCategory,
  addExam,
  getExam,
  deleteCategory,
};
