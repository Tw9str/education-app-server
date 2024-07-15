const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Register User
const register = async (req, res) => {
  const { username, email, password } = req.body;
  const salt = await bcrypt.genSalt();
  const HashedPassword = await bcrypt.hash(password, salt);
  const user = new User({ username, email, password: HashedPassword });
  try {
    await user.save();
    res.status(201).json({ success: true, message: "Register successful" });
  } catch (err) {
    res.status(500).json({ error: err.message, message: "User Existed" });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).lean();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );
    delete user.password;
    res
      .status(200)
      .json({ token, user, success: true, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

/* Seed User */
const createSeedUser = async (req, res) => {
  try {
    const seedUser = await User.findOne({
      email: process.env.SEED_EMAIL,
    }).lean();
    if (seedUser) {
      delete seedUser.password;
      return res.status(400).json({ message: "Seed user already existed." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.SEED_PASSWORD, salt);

    const newUser = new User({
      username: "admin",
      email: process.env.SEED_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    await newUser.save();
    const { password, ...modifiedNewUser } = newUser._doc;

    return res
      .status(200)
      .json({ message: "Seed user created successfully.", modifiedNewUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Internal server error.", error: err.message });
  }
};

module.exports = { register, login, createSeedUser };
