const Ad = require("../models/ad");
const User = require("../models/user");
const Category = require("../models/category");
const { promisify } = require("util");
const { join } = require("path");
const fs = require("fs");
const Exam = require("../models/exam");

const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().populate("category").populate("user").lean();

    ads.forEach((ad) => {
      delete ad.user.password;
    });

    res.json(ads);
  } catch (error) {
    console.error("Error fetching Categorys:", error);

    res.status(500).json({ error: "Failed to fetch Categorys" });
  }
};

const getAd = async (req, res) => {
  const { slug } = req.params;
  try {
    const ad = await Ad.findOne({ slug }).populate("user").lean();
    if (!ad) {
      return res.status(404).send({ message: "Ad not found" });
    }
    delete ad.user.password;
    res.json(ad);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getRelatedAds = async (req, res) => {
  const { category } = req.params;
  try {
    const relatedAds = await Ad.find({ category })
      .populate("category")
      .populate("user")
      .lean();
    if (!relatedAds) {
      return res.status(404).send({ message: "No relatedAds found" });
    }
    relatedAds.forEach((ad) => {
      delete ad.user.password;
    });
    res.json(relatedAds);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserAds = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const ads = await Ad.find({ user: user._id })
      .populate("category")
      .populate("user")
      .lean();
    if (!ads) {
      return res.status(404).send({ message: "Ad not found" });
    }
    ads.forEach((ad) => {
      delete ad.user.password;
    });
    res.json(ads);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getExamCategory = async (req, res) => {
  const { title } = req.params;
  try {
    const category = await Category.findOne({ title });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const exams = await Exam.find({ category: category._id })
      .populate("user")
      .populate("category")
      .lean();

    if (!exams || exams.length === 0) {
      return res
        .status(404)
        .json({ message: "No exams found for this category" });
    }
    exams.forEach((exams) => {
      delete exams.user.password;
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addListing = async (req, res) => {
  const { title, category, price, description, userId } = req.body;
  const imgsSrc = req.files?.map((file) => file.filename);

  const ad = new Ad({
    title,
    category,
    price,
    description,
    imgsSrc,
    user: userId,
  });
  try {
    await ad.save();
    res.status(201).json({ success: true, message: "Ad saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSold = async (req, res) => {
  try {
    const { id } = req.params;
    const Category = await Category.findById(id);
    if (!Category) {
      return res.status(404).json({ message: "Category not found" });
    }
    Category.sold = !Category.sold;
    await Category.save();
    res.status(201).json({ success: true, message: "Sold status updated" });
  } catch (error) {
    res.status(500).json({ message: "Error saving update" });
  }
};

const deleteFile = promisify(fs.unlink);

const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    for (const image of ad.imgsSrc) {
      const imagePath = join(
        __dirname,
        "../../frontend/public/assets/imgs",
        image
      );
      if (fs.existsSync(imagePath)) {
        await deleteFile(imagePath);
      }
    }
    await ad.deleteOne();
    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAds,
  getAd,
  getRelatedAds,
  getUserAds,
  getExamCategory,
  addListing,
  updateSold,
  deleteAd,
};
