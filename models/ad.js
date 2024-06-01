const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imgsSrc: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    slug: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

adSchema.pre("save", async function (next) {
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

const Ad = mongoose.model("Ad", adSchema);

module.exports = Ad;
