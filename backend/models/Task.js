const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },

    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    attachments: [
      {
        filename: {
          type: String,
          required: true,
        },
        originalName: {
          type: String,
          required: true,
        },
        filePath: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
          default: 0,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", taskSchema);
