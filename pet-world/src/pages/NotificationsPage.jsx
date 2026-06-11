import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Bell, Trash2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/utils/axiosInstance";

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Load notifications
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadNotifications = async () => {
      try {
        const res = await axiosInstance.get("/notifications");
        // API returns { success, notifications, count }
        setNotifications(res.data?.notifications || []);
        setLoading(false);
      } catch (err) {
        console.error("Error loading notifications:", err);
        // Mock notifications for demo
        setNotifications([
          {
            id: 1,
            type: "order",
            message: "Your order #12345 has been shipped!",
            timestamp: new Date(),
            read: false,
          },
          {
            id: 2,
            type: "wishlist",
            message: "🎉 An item in your wishlist is now on sale!",
            timestamp: new Date(Date.now() - 3600000),
            read: false,
          },
          {
            id: 3,
            type: "info",
            message: "📢 New pet food collection available now",
            timestamp: new Date(Date.now() - 86400000),
            read: true,
          },
        ]);
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user, navigate]);

  // ✅ Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((notif) => {
          const nid = notif._id || notif.id;
          return nid === id ? { ...notif, read: true } : notif;
        })
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // 🗑️ Delete notification
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(notifications.filter((notif) => (notif._id || notif.id) !== id));
      toast.success("✅ Notification deleted");
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("❌ Error deleting notification");
    }
  };

  // 🗑️ Delete all
  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      // Call backend to delete all notifications for user
      axiosInstance
        .delete(`/notifications`)
        .then(() => {
          setNotifications([]);
          toast.success("✅ All notifications deleted");
        })
        .catch((err) => {
          console.error("Error deleting all notifications:", err);
          toast.error("❌ Failed to delete notifications");
        });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "wishlist":
        return <AlertCircle className="w-5 h-5 text-pink-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <div className="w-12 h-12 border-4 border-pink-500 border-t-indigo-600 rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
              <Bell className="w-8 h-8" /> Notifications
            </h1>
            <p className="text-gray-600">Stay updated with your latest notifications</p>
          </div>
          {notifications.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAll}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Clear All
            </motion.button>
          )}
        </motion.div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Notifications</h3>
            <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif._id || notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl transition ${
                    notif.read
                      ? "bg-white/50 border border-gray-200"
                      : "bg-gradient-to-r from-pink-100 to-indigo-100 border border-pink-200"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1">
                      <p className={`${notif.read ? "text-gray-600" : "font-semibold text-gray-800"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt || notif.timestamp).toLocaleDateString()} at{" "}
                        {new Date(notif.createdAt || notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMarkAsRead(notif._id || notif.id)}
                        className="p-2 hover:bg-white/50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(notif._id || notif.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
