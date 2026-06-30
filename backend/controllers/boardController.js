const Board = require("../models/Board");
const User = require("../models/User");
const Task = require("../models/Task");
const { populateBoardUsers } = require("../middleware/boardAuthMiddleware");
const { createNotification } = require("../controllers/notificationController");
const { sendNotification } = require("../socket");

const createBoard = async (req, res) => {
  try {
    const { title } = req.body;

    const board = await Board.create({
      title,
      owner: req.user._id,
      members: [],
    });

    const populatedBoard = await populateBoardUsers(Board.findById(board._id));

    const boardNotification = await createNotification({
      recipient: req.user._id,
      sender: req.user._id,
      title: "Board created",
      message: `Board "${board.title}" is ready.`,
      type: "board-created",
    });

    sendNotification(req.user._id, boardNotification);

    res.status(201).json(populatedBoard);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBoards = async (req, res) => {
  try {
    const boards = await populateBoardUsers(
      Board.find({
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      }),
    );

    res.json(boards);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getBoardById = async (req, res) => {
  try {
    res.json(req.board);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateBoard = async (req, res) => {
  try {
    const board = req.board;

    board.title = req.body.title || board.title;

    const updatedBoard = await board.save(); //Saves the changes permanently to MongoDB.
    await updatedBoard.populate("owner", "name email");
    await updatedBoard.populate("members", "name email");

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const board = req.board;

    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    res.json({
      message: "Board deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const board = req.board;

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (board.owner._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "Cannot invite yourself" });
    }

    const alreadyMember = board.members.some(
      (member) => member._id.toString() === user._id.toString(),
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "Already a member" });
    }

    board.members.push(user._id);
    await board.save();
    await board.populate("owner", "name email");
    await board.populate("members", "name email");

    const inviteNotification = await createNotification({
      recipient: user._id,
      sender: req.user._id,
      title: "Board invitation",
      message: `You were invited to join "${board.title}".`,
      type: "board-invited",
    });

    sendNotification(user._id, inviteNotification);

    res.json(board);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const board = req.board;
    const userId = req.params.userId;

    if (board.owner._id.toString() === userId) {
      return res.status(400).json({ message: "Owner cannot remove themselves" });
    }

    const memberExists = board.members.some(
      (member) => member._id.toString() === userId,
    );

    if (!memberExists) {
      return res.status(404).json({ message: "Member not found" });
    }

    const removedUser = await User.findById(userId).select("-password");

    if (!removedUser) {
      return res.status(404).json({ message: "Member not found" });
    }

    board.members = board.members.filter(
      (member) => member._id.toString() !== userId,
    );

    await board.save();
    await board.populate("owner", "name email");
    await board.populate("members", "name email");

    const removedNotification = await createNotification({
      recipient: removedUser._id,
      sender: req.user._id,
      title: "Removed from board",
      message: `You were removed from "${board.title}".`,
      type: "board-removed",
    });

    sendNotification(removedUser._id, removedNotification);

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
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember,
};
