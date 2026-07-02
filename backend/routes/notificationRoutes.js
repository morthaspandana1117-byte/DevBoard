const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markNotificationAsRead);
router.patch("/read-all", protect, markAllNotificationsAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
