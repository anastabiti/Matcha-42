import  { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Badge from "@mui/material/Badge";
import { socket } from "./Chat";

interface Notification {
  notify_id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  fromUsername: string;
  type: string;
}

const NotificationButton = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/notifications`,
        {
          credentials: 'include'
        }
      );
      if(response.ok)
      {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
          credentials: 'include'
        
      });
      setNotifications(notifications.map(notif => 
        notif.notify_id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/notifications/read-all`, {
        method: "PATCH",
        
          credentials: 'include'
        
      });
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    socket.on("notification", (newNotification: Notification) => {
      console.log(newNotification, " newNotification---")
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <Badge 
        badgeContent={unreadCount} 
        color="error"
        max={99}
      >
        <NotificationsIcon
          className="cursor-pointer hover:opacity-80 transition-opacity"
          color="primary"
          onClick={() => setShowNotifications(!showNotifications)}
        />
      </Badge>

      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 max-h-[80vh] overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <DoneAllIcon className="w-4 h-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4 text-gray-600">Loading...</div>
          ) : notifications.length === 0 ? (
            <p className="text-center py-4 text-gray-600">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.notify_id}
                  className={`p-3 rounded-md transition-colors ${
                    notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-800">{notification.content}</p>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.notify_id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      From: {notification.fromUsername}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;