const fs = require("fs");
const path = require("path");
const Task = require("../models/Task");
const User = require("../models/User");
const { createNotification } = require("../controllers/notificationController");
const { sendNotification } = require("../socket");

const populateTaskAssignedTo = (query) =>
  query.populate("assignedTo", "_id name email");

const isBoardOwner = (board, userId) => {
  const ownerId = board?.owner?._id || board?.owner;
  return ownerId?.toString() === userId?.toString();
};

const createTask = async (req, res) => {
  try {
    const { title, description, board, assignedTo, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      board,
      assignedTo: assignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      reminderSent: false,
    });

    const populatedTask = await populateTaskAssignedTo(Task.findById(task._id));

    const recipients = [req.user._id];
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      recipients.push(assignedTo);
    }

    await Promise.all(
      recipients.map((recipientId) =>
        createNotification({
          recipient: recipientId,
          sender: req.user._id,
          title: assignedTo ? "Task assigned" : "Task created",
          message: assignedTo
            ? `You were assigned to "${task.title}".`
            : `A new task "${task.title}" was created.`,
          type: assignedTo ? "task-assigned" : "task-created",
        }).then((notification) => sendNotification(recipientId, notification)),
      ),
    );

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTask = async (req, res) => {
  try {
    const tasks = await populateTaskAssignedTo(
      Task.find({
        board: req.params.boardId,
      }),
    );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const populatedTask = await populateTaskAssignedTo(Task.findById(req.task._id));

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = req.task;
    const board = req.board;
    const { title, description, status, assignedTo, dueDate } = req.body;
    const previousAssignedTo = task.assignedTo?.toString();
    const previousStatus = task.status;
    const previousDueDate = task.dueDate?.toString();

    if (assignedTo !== undefined) {
      if (!isBoardOwner(board, req.user._id)) {
        return res.status(403).json({
          message: "Owner access required to change assignment",
        });
      }

      if (!assignedTo) {
        task.assignedTo = null;
      } else {
        const assignedUser = await User.findById(assignedTo);

        if (!assignedUser) {
          return res.status(404).json({ message: "Assigned user not found" });
        }

        const boardUserIds = [
          board.owner?._id?.toString(),
          ...(board.members || []).map((member) => member._id?.toString()),
        ].filter(Boolean);

        if (!boardUserIds.includes(assignedTo.toString())) {
          return res.status(400).json({
            message: "Assigned user must belong to the board",
          });
        }

        task.assignedTo = assignedTo;
      }
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
      task.reminderSent = false;
    }

    const updatedTask = await task.save();
    const populatedTask = await populateTaskAssignedTo(Task.findById(updatedTask._id));

    const assignmentChanged = assignedTo !== undefined && previousAssignedTo !== task.assignedTo?.toString();
    const statusChanged = status !== undefined && previousStatus !== task.status;
    const dueDateChanged = dueDate !== undefined && previousDueDate !== task.dueDate?.toString();

    if (assignmentChanged || statusChanged || dueDateChanged) {
      const recipients = [req.user._id];
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        recipients.push(task.assignedTo);
      }

      await Promise.all(
        recipients.map((recipientId) =>
          createNotification({
            recipient: recipientId,
            sender: req.user._id,
            title: assignmentChanged ? "Task assignment updated" : "Task updated",
            message: assignmentChanged
              ? `You were assigned to "${task.title}".`
              : `Task "${task.title}" was updated.`,
            type: assignmentChanged ? "task-assigned" : "task-updated",
          }).then((notification) => sendNotification(recipientId, notification)),
        ),
      );
    }

    res.status(200).json(populatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = req.task;

    await task.deleteOne();

    const notificationRecipients = [req.user._id];
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      notificationRecipients.push(task.assignedTo);
    }

    await Promise.all(
      notificationRecipients.map((recipientId) =>
        createNotification({
          recipient: recipientId,
          sender: req.user._id,
          title: "Task deleted",
          message: `Task "${task.title}" was deleted.`,
          type: "task-deleted",
        }).then((notification) => sendNotification(recipientId, notification)),
      ),
    );

    res.json({ message: "Task deleted succesfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const uploadTaskAttachments = async (req, res) => {
  try {
    const task = req.task;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileSize: file.size,
      uploadedAt: new Date(),
    }));

    task.attachments = [...(task.attachments || []), ...attachments];
    await task.save();

    const notificationRecipients = [req.user._id];
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      notificationRecipients.push(task.assignedTo);
    }

    await Promise.all(
      notificationRecipients.map((recipientId) =>
        createNotification({
          recipient: recipientId,
          sender: req.user._id,
          title: "Attachment uploaded",
          message: `${attachments.length} file(s) were added to "${task.title}".`,
          type: "task-attachment",
        }).then((notification) => sendNotification(recipientId, notification)),
      ),
    );

    const populatedTask = await populateTaskAssignedTo(Task.findById(task._id));

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTaskAttachment = async (req, res) => {
  try {
    const task = req.task;
    const { attachmentId } = req.params;

    const attachment = task.attachments?.id(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const attachmentPath = path.join(__dirname, "..", attachment.filePath.replace(/^\//, ""));

    if (fs.existsSync(attachmentPath)) {
      fs.unlinkSync(attachmentPath);
    }

    task.attachments = task.attachments.filter((item) => item._id.toString() !== attachmentId);
    await task.save();

    const populatedTask = await populateTaskAssignedTo(Task.findById(task._id));

    res.json({ message: "Attachment deleted successfully", task: populatedTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignTaskToMember = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = req.task;
    const board = req.board;

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!assignedTo) {
      task.assignedTo = null;
      const updatedTask = await task.save();
      const populatedTask = await populateTaskAssignedTo(Task.findById(updatedTask._id));

      const notificationRecipients = [req.user._id];
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        notificationRecipients.push(task.assignedTo);
      }

      await Promise.all(
        notificationRecipients.map((recipientId) =>
          createNotification({
            recipient: recipientId,
            sender: req.user._id,
            title: "Task assignment updated",
            message: `Assignment for "${task.title}" was cleared.`,
            type: "task-assigned",
          }).then((notification) => sendNotification(recipientId, notification)),
        ),
      );

      return res.json(populatedTask);
    }

    const assignedUser = await User.findById(assignedTo);

    if (!assignedUser) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const boardUserIds = [
      board.owner?._id?.toString(),
      ...(board.members || []).map((member) => member._id?.toString()),
    ].filter(Boolean);

    if (!boardUserIds.includes(assignedTo.toString())) {
      return res.status(400).json({
        message: "Assigned user must belong to the board",
      });
    }

    task.assignedTo = assignedTo;
    const updatedTask = await task.save();

    const populatedTask = await populateTaskAssignedTo(Task.findById(updatedTask._id));

    const notificationRecipients = [req.user._id];
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      notificationRecipients.push(assignedTo);
    }

    await Promise.all(
      notificationRecipients.map((recipientId) =>
        createNotification({
          recipient: recipientId,
          sender: req.user._id,
          title: "Task assignment updated",
          message: `You were assigned to "${task.title}".`,
          type: "task-assigned",
        }).then((notification) => sendNotification(recipientId, notification)),
      ),
    );

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  deleteTask,
  uploadTaskAttachments,
  deleteTaskAttachment,
  assignTaskToMember,
};

