const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const examSchema = new Schema(
  {
    title: { type: String, required: true },
    questions: [
      { type: Schema.Types.ObjectId, ref: "Question", required: true },
    ],
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

examSchema.pre("save", async function (next) {
  try {
    const category = await mongoose.model("Category").findById(this.category);
    if (!category) {
      throw new Error("Category not found");
    }

    this.slug = generateSlug(this.title, category.title, this._id);
    next();
  } catch (error) {
    next(error);
  }
});

function generateSlug(title, category, _id) {
  const slug = `${_id} ${category} ${title}`.toLowerCase().replace(/\s+/g, "-");
  return slug;
}

module.exports = mongoose.model("Exam", examSchema);
