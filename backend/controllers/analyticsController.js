const Board = require("../models/Board");
const Task = require("../models/Task");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const accessibleBoards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
    }).select("_id title");

    const boardIds = accessibleBoards.map((board) => board._id);

    const [taskStats, statusBreakdown, tasksPerBoard] = await Promise.all([
      Task.aggregate([
        {
          $match: {
            board: { $in: boardIds },
          },
        },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            todoTasks: {
              $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] },
            },
            inProgressTasks: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
            doneTasks: {
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
            },
          },
        },
      ]),
      Task.aggregate([
        {
          $match: {
            board: { $in: boardIds },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
        {
          $sort: {
            status: 1,
          },
        },
      ]),
      Task.aggregate([
        {
          $match: {
            board: { $in: boardIds },
          },
        },
        {
          $group: {
            _id: "$board",
            totalTasks: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "boards",
            localField: "_id",
            foreignField: "_id",
            as: "boardInfo",
          },
        },
        {
          $unwind: "$boardInfo",
        },
        {
          $project: {
            _id: 0,
            boardName: "$boardInfo.title",
            totalTasks: 1,
          },
        },
        {
          $sort: {
            totalTasks: -1,
          },
        },
      ]),
    ]);

    const stats = taskStats[0] || {
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      doneTasks: 0,
    };

    const statusSummary = [
      { status: "todo", count: 0 },
      { status: "in-progress", count: 0 },
      { status: "done", count: 0 },
    ].map((item) => {
      const match = statusBreakdown.find((entry) => entry.status === item.status);
      return {
        status: item.status,
        count: match?.count || 0,
      };
    });

    const totalTasks = stats.totalTasks || 0;
    const completedPercentage = totalTasks
      ? Number(((stats.doneTasks || 0) / totalTasks) * 100).toFixed(1)
      : 0;
    const pendingPercentage = totalTasks
      ? Number(((totalTasks - (stats.doneTasks || 0)) / totalTasks) * 100).toFixed(1)
      : 0;

    res.json({
      totalBoards: accessibleBoards.length,
      totalTasks,
      todoTasks: stats.todoTasks || 0,
      inProgressTasks: stats.inProgressTasks || 0,
      doneTasks: stats.doneTasks || 0,
      completedPercentage,
      pendingPercentage,
      tasksByStatus: statusSummary,
      tasksPerBoard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
};
