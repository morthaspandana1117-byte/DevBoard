const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { isTaskBoardOwner } = require("../middleware/boardAuthMiddleware");

const { assignTaskToMember } = require("../controllers/taskController");

const router = express.Router();

router.patch("/:taskId/assign", protect, isTaskBoardOwner, assignTaskToMember);

module.exports = router;

