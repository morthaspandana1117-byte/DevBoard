const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: ["Admin", "Member"],
      default: "Member",
    },

    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    reminderTiming: {
      type: String,
      enum: ["30m", "1h", "6h", "1d"],
      default: "1d",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema, "MERNproject");
