const Category = require("../models/category");
const Exam = require("../models/exam");
const Question = require("../models/question");
const { promisify } = require("util");
const { join } = require("path");
const fs = require("fs");

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    const categoriesWithExamCounts = await Promise.all(
      categories.map(async (category) => {
        const examCount = await Exam.countDocuments({ category: category._id });
        return {
          ...category,
          examCount: examCount,
        };
      })
    );

    res.json(categoriesWithExamCounts);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
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

const addCategory = async (req, res) => {
  const { title } = req.body;

  if (/[^a-zA-Z0-9\s]/.test(title)) {
    return res.status(400).json({
      success: false,
      message:
        "Title contains special characters. Please provide a valid title.",
    });
  }

  const formattedTitle = title.toLowerCase().replace(/\s+/g, "-");

  const category = new Category({
    title: formattedTitle,
  });
  try {
    await category.save();
    res.status(201).json({ success: true, message: "Category saved" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Name already used!", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { plan, isVisible, title } = req.body;

  try {
    // Find the category by ID and update it
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { plan, isVisible, title },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating category" });
  }
};

const deleteFile = promisify(fs.unlink);

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the category by ID
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete the category
    await category.deleteOne();

    // Find and delete all exams related to the category
    const exams = await Exam.find({ category: id });
    for (const exam of exams) {
      // Find all questions related to the exam
      const questions = await Question.find({ _id: { $in: exam.questions } });

      for (const question of questions) {
        // If question has an image, delete it from the filesystem
        if (question.image) {
          const imagePath = join(
            __dirname,
            "../public/questions",
            question.image
          );
          deleteFile(imagePath, (err) => {
            if (err) console.error(`Failed to delete image ${imagePath}:`, err);
          });
        }
      }

      // Delete the questions related to the exam
      await Question.deleteMany({ _id: { $in: exam.questions } });

      // Delete the exam
      await exam.deleteOne();
    }

    res.json({
      message:
        "Category, corresponding exams, and related questions and images deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
};
