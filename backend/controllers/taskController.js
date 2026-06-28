const Task = require("../models/Task");
const Board = require("../models/Board");

const createTask = async (req, res) => {
  try {
    const { title, description, board } = req.body;

    const boardExists = await Board.findById(board);

    if (!boardExists) {
      return res.status(404).json({
        message: "Board Not Found !",
      });
    }

    if (boardExists.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const task = await Task.create({
      title,
      description,
      board,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({
        message: "Board Not Found !",
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const tasks = await Task.find({
      board: req.params.boardId,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const board = await Board.findById(task.board);

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const board = await Board.findById(task.board);

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found !",
      });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;

    const updatedTask = await task.save();

    res.status(201).json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task Not Found !",
      });
    }

    const board = await Board.findById(task.board);

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted succesfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
};
