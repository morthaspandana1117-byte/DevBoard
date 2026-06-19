const express = require('express');

const router = express.Router();

const { createBoard, getBoards, getBoardById } = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBoard);
router.get('/', protect, getBoards);
router.get('/:id', protect, getBoardById);

module.exports = router;