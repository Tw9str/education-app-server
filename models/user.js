const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._]+$/,
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
      maxlength: [254, "Email cannot exceed 254 characters"],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password cannot exceed 128 characters"],
    },
    plan: {
      type: String,
      enum: ["free", "basic", "premium"],
      default: "free",
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
