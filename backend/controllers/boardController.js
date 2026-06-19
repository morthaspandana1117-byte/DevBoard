const Board = require('../models/Board');

const createBoard = async (req, res) => {
  try {

    const { title } = req.body;

    const board = await Board.create({
      title,
      owner: req.user._id,
    });

    res.status(201).json(board);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBoards = async (req, res) => {
  try {

    const boards = await Board.find({
      owner: req.user._id,
    });

    res.json(boards);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBoardById = async (req, res) => {
  try {

    const board = await Board.findById(
      req.params.id
    );

    if (
      board.owner.toString() !==             // Authorrization - checks if the user making the request is the owner of the board or not
      req.user._id.toString()                //                - what the user is authorized to do
    ) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }
    
    if (!board) {
      return res.status(404).json({
        message: 'Board not found',
      });
    }

    res.json(board);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
};