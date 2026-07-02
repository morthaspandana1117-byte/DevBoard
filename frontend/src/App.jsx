import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";

import AppRoutes from "./routes/AppRoutes";
import client from "./api/client";

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function App() {
  const location = useLocation();
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("token"));
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const syncAuth = () => {
      setAuthToken(localStorage.getItem("token"));
    };

    syncAuth();
    window.addEventListener("auth:changed", syncAuth);

    return () => window.removeEventListener("auth:changed", syncAuth);
  }, [location.pathname]);

  const token = authToken;
  const currentUserId = useMemo(() => decodeToken(token)?.userId, [token]);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        const response = await client.get("/notifications");
        setNotifications(response.data || []);
      } catch {
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!token || !currentUserId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("authenticate", currentUserId);
    });

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.title, {
        autoClose: 4000,
      });
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, token]);

  const markAsRead = async (notificationId) => {
    try {
      await client.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch {
      // Ignore read-state errors.
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await client.patch("/notifications/read-all");
      setNotifications(response.data || []);
    } catch {
      // Ignore read-state errors.
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await client.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId),
      );
    } catch {
      // Ignore delete errors.
    }
  };

  return (
    <>
      {token && (
        <div className="notification-shell">
          <button
            className="notification-bell"
            onClick={() => setShowNotifications((prev) => !prev)}
            type="button"
          >
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <strong>Notifications</strong>
                <button className="btn btn-secondary" onClick={markAllAsRead} type="button">
                  Mark all read
                </button>
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="notification-empty">No notifications yet.</p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification._id} className={`notification-item ${notification.isRead ? "" : "unread"}`}>
                      <div>
                        <strong>{notification.title}</strong>
                        <p>{notification.message}</p>
                      </div>
                      <div className="notification-actions">
                        {!notification.isRead && (
                          <button className="btn btn-outline" onClick={() => markAsRead(notification._id)} type="button">
                            Read
                          </button>
                        )}
                        <button className="btn btn-danger" onClick={() => deleteNotification(notification._id)} type="button">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AppRoutes />
      <ToastContainer position="top-right" />
    </>
  );
}

export default App;
