const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const {
  addExam,
  getExam,
  getExams,
  deleteExam,
  updateExam,
  getExamCategory,
} = require("./controllers/exam");
const {
  login,
  register,
  createSeedUser,
  getUsers,
  updateUserRole,
  updateUserPlan,
} = require("./controllers/user");

const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} = require("./controllers/category");
const verifyRole = require("./middleware/auth");
const checkout = require("./controllers/stripe");
require("dotenv").config();

// Middleware
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/questions");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "-")}`);
  },
});

const upload = multer({ storage });

app.post(
  "/api/exams/create-exam",
  verifyRole(["admin", "teacher"]),
  upload.any(),
  addExam
);
app.get("/api/exams/exam/:slug", getExam);
app.put("/api/exams/exam/edit/:id", upload.any(), updateExam);
app.get("/api/exams", getExams);
app.get("/api/users", getUsers);
app.patch("/api/users/update/:id", updateUserPlan);
app.post("/api/auth/login", login);
app.post("/api/auth/register", register);
app.get("/api/auth/createSeedUser", createSeedUser);
app.get("/api/categories", getCategories);
app.post("/api/category/add", addCategory);
app.put("/api/categories/update/:id", updateCategory);
app.get("/api/categories/:title", getExamCategory);
app.delete("/api/categories/delete/:id", verifyRole(["admin"]), deleteCategory);
app.delete("/api/exams/delete/:id", verifyRole(["admin"]), deleteExam);
app.patch("/api/users/promote/:id", verifyRole(["admin"]), updateUserRole);
app.post("/create-checkout-session", checkout);

/* Server */
const DB_URI = process.env.DB_URI;

const PORT = process.env.PORT || 5000;

mongoose
  .connect(DB_URI)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    })
  )
  .catch((err) => console.log(err));
