import Notification from "../models/notificationModel.js";

/* 🔔 GET ALL NOTIFICATIONS FOR USER */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

/* ✅ MARK NOTIFICATION AS READ */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Verify ownership
    if (notification.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

/* 🗑️ DELETE NOTIFICATION */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Verify ownership
    if (notification.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
};

/* 📢 CREATE NOTIFICATION (Internal Helper) */
export const createNotification = async (userId, type, title, message, relatedId = null, relatedType = "other") => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      read: false,
    });
    return notification;
  } catch (error) {
    console.error("❌ Error creating notification:", error);
    return null;
  }
};

/* 🧹 DELETE ALL NOTIFICATIONS FOR USER */
export const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting all notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notifications",
    });
  }
};
