const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  isBoardMember,
  isTaskBoardMember,
  isTaskBoardOwner,
} = require("../middleware/boardAuthMiddleware");

const {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
  uploadTaskAttachments,
  deleteTaskAttachment,
} = require("../controllers/taskController");
const { uploadAttachments } = require("../middleware/uploadMiddleware");

router.post("/", protect, isBoardMember, createTask);
router.get("/board/:boardId", protect, isBoardMember, getTask);
router.get("/:id", protect, isTaskBoardMember, getTaskById);
router.put("/:id", protect, isTaskBoardMember, updateTask);
router.delete("/:id", protect, isTaskBoardOwner, deleteTask);
router.post(
  "/:id/upload",
  protect,
  isTaskBoardMember,
  uploadAttachments,
  uploadTaskAttachments,
);
router.delete(
  "/:id/attachment/:attachmentId",
  protect,
  isTaskBoardMember,
  deleteTaskAttachment,
);

module.exports = router;
