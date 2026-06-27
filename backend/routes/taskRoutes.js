const express = require('express');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

const {  createTask, getTask, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');

router.post('/', protect, createTask);
router.get('/board/:boardId', protect, getTask);
router.get('/:id', protect, getTaskById);
router.put('/:id',protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;