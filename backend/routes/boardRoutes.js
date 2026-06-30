const express = require("express");

const router = express.Router();

const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember,
} = require("../controllers/boardController");
const { protect } = require("../middleware/authMiddleware");
const {
  isBoardOwner,
  isBoardMember,
} = require("../middleware/boardAuthMiddleware");

router.post("/", protect, createBoard);
router.get("/", protect, getBoards);
router.get("/:id", protect, isBoardMember, getBoardById);
router.put("/:id", protect, isBoardOwner, updateBoard);
router.delete("/:id", protect, isBoardOwner, deleteBoard);
router.post("/:boardId/invite", protect, isBoardOwner, inviteMember);
router.delete("/:boardId/members/:userId", protect, isBoardOwner, removeMember);

module.exports = router;
