const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    // req.user is already selected without password by authMiddleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, reminderEnabled, reminderTiming } = req.body;

    if (email) {
      const existingUser = await User.findOne({ email }).select("_id");
      if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          message: "Email is already in use",
        });
      }
    }

    // Prevent password updates regardless of request body
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(reminderEnabled !== undefined ? { reminderEnabled } : {}),
        ...(reminderTiming ? { reminderTiming } : {}),
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

