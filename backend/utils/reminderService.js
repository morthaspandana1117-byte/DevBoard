const nodeCron = require("node-cron");
const Task = require("../models/Task");
const { sendMail } = require("../config/mail");
const { createNotification } = require("../controllers/notificationController");
const { sendNotification } = require("../socket");

const REMINDER_TIMINGS = {
  "30m": 30,
  "1h": 60,
  "6h": 360,
  "1d": 1440,
};

const getReminderOffsetMinutes = (user) => REMINDER_TIMINGS[user?.reminderTiming] ?? REMINDER_TIMINGS["1d"];

const getReminderTargetTime = (task, user) => {
  if (!task?.dueDate) return null;

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  const offsetMinutes = getReminderOffsetMinutes(user);
  return new Date(dueDate.getTime() - offsetMinutes * 60 * 1000);
};

const sendPendingTaskReminders = async () => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      dueDate: { $ne: null },
      reminderSent: false,
    })
      .populate("assignedTo", "_id name email reminderEnabled reminderTiming")
      .populate({
        path: "board",
        select: "title owner",
        populate: {
          path: "owner",
          select: "_id name email reminderEnabled reminderTiming",
        },
      });

    for (const task of tasks) {
      const recipientUser = task.assignedTo || task.board?.owner;
      if (!recipientUser?.email) {
        continue;
      }

      const reminderEnabled = recipientUser?.reminderEnabled ?? true;
      if (!reminderEnabled) {
        continue;
      }

      const reminderTargetTime = getReminderTargetTime(task, recipientUser);
      if (!reminderTargetTime || now < reminderTargetTime) {
        continue;
      }

      try {
        await sendMail({
          to: recipientUser.email,
          subject: "Task Reminder",
          text: [
            `Hello ${recipientUser.name || "there"},`,
            "",
            "This is a reminder for your task.",
            `Task Title: ${task.title}`,
            `Description: ${task.description || "No description provided"}`,
            `Status: ${task.status}`,
            `Board Name: ${task.board?.title || "Unknown board"}`,
            `Due Date: ${new Date(task.dueDate).toLocaleString()}`,
            "",
            "Please complete the task as soon as possible.",
            "",
            "Thank you,",
            "DevBoard Team",
          ].join("\n"),
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
              <h2>Task Reminder</h2>
              <p>Hello ${recipientUser.name || "there"},</p>
              <p>This is a reminder for your task.</p>
              <ul>
                <li><strong>Task Title:</strong> ${task.title}</li>
                <li><strong>Description:</strong> ${task.description || "No description provided"}</li>
                <li><strong>Status:</strong> ${task.status}</li>
                <li><strong>Board Name:</strong> ${task.board?.title || "Unknown board"}</li>
                <li><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</li>
              </ul>
              <p>Please complete the task as soon as possible.</p>
              <p>Thank you,<br />DevBoard Team</p>
            </div>
          `,
        });

        task.reminderSent = true;
        await task.save();

        const notification = await createNotification({
          recipient: recipientUser._id,
          sender: task.board?.owner?._id || recipientUser._id,
          title: "Email reminder sent",
          message: `A reminder email was sent for "${task.title}".`,
          type: "task-reminder",
        });

        sendNotification(recipientUser._id, notification);
      } catch (error) {
        console.error(`Reminder failed for task ${task._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Reminder job failed:", error);
  }
};

const startReminderCron = () => {
  nodeCron.schedule("* * * * *", () => {
    sendPendingTaskReminders().catch((error) => {
      console.error("Reminder scheduler error:", error);
    });
  });
};

module.exports = {
  sendPendingTaskReminders,
  startReminderCron,
};
