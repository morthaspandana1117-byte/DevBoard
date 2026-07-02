const Board = require("../models/Board");
const Task = require("../models/Task");

const populateBoardUsers = (query) =>
  query.populate("owner", "name email").populate("members", "name email");

const getId = (value) => (value?._id || value).toString();

const getTaskId = (req) => req.params.id || req.params.taskId;

const isOwner = (board, userId) => getId(board.owner) === userId.toString();

const isMember = (board, userId) =>
  board.members.some((member) => getId(member) === userId.toString());

const findBoard = async (boardId) => populateBoardUsers(Board.findById(boardId));

const isBoardOwner = async (req, res, next) => {
  try {
    const board = await findBoard(req.params.id || req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!isOwner(board, req.user._id)) {
      return res.status(403).json({ message: "Owner access required" });
    }

    req.board = board;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isBoardMember = async (req, res, next) => {
  try {
    const boardId = req.params.id || req.params.boardId || req.body.board;
    const board = await findBoard(boardId);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!isOwner(board, req.user._id) && !isMember(board, req.user._id)) {
      return res.status(403).json({ message: "Board access required" });
    }

    req.board = board;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isTaskBoardMember = async (req, res, next) => {
  try {
    const task = await Task.findById(getTaskId(req));

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const board = await findBoard(task.board);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!isOwner(board, req.user._id) && !isMember(board, req.user._id)) {
      return res.status(403).json({ message: "Board access required" });
    }

    req.task = task;
    req.board = board;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const isTaskBoardOwner = async (req, res, next) => {
  try {
    const task = await Task.findById(getTaskId(req));

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const board = await findBoard(task.board);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!isOwner(board, req.user._id)) {
      return res.status(403).json({ message: "Owner access required" });
    }

    req.task = task;
    req.board = board;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  isBoardOwner,
  isBoardMember,
  isTaskBoardMember,
  isTaskBoardOwner,
  populateBoardUsers,
};
