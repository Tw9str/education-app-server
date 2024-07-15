const jwt = require("jsonwebtoken");

const verifyRole = (roles) => async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Access Denied" });
    }

    token = token.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = verifyRole;
