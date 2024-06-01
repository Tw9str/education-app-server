const Ad = require("../models/ad");

const verifyAdOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (ad.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You cannot delete this ad" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = verifyAdOwner;
