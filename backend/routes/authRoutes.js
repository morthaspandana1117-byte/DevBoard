const express = require('express');
const router = express.Router();

const { registerUser,loginUser,getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { createBoard } = require('../controllers/boardController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/', protect, createBoard);


module.exports = router;