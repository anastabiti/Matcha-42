import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketProps {
  currentUsername: string;
}

interface UserStatus {
  username: string;
  status: "online" | "offline";
  lastSeen?: number;
}

interface UserStatusState {
  status: "online" | "offline";
  lastSeen?: number | null;
}

export const useSocket = ({ currentUsername }: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState<
    Map<string, UserStatusState>
  >(new Map());
  const socketRef = useRef<Socket | null>(null);
  const statusRequests = useRef<Set<string>>(new Set());

  const fetchLastSeen = async (username: string): Promise<number | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_IP}/user-status/${username}`
      );
      const data = await response.json();
      return data.lastSeen || null;
    } catch (error) {
      console.error("Error fetching last seen:", error);
      return null;
    }
  };

  const updateUserStatus = async (username: string) => {
    if (!statusRequests.current.has(username)) {
      statusRequests.current.add(username);
      const lastSeen = await fetchLastSeen(username);
      setUserStatuses((prev) => {
        const newMap = new Map(prev);
        const currentStatus = newMap.get(username);
        newMap.set(username, {
          status: currentStatus?.status || "offline",
          lastSeen: lastSeen,
        });
        return newMap;
      });
      statusRequests.current.delete(username);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_IP, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("onlineUsers", (users: UserStatus[]) => {
      setUserStatuses((prev) => {
        const newMap = new Map(prev);
        users.forEach((user) => {
          const currentStatus = newMap.get(user.username);
          newMap.set(user.username, {
            status: user.status,
            lastSeen: currentStatus?.lastSeen || null,
          });
        });
        return newMap;
      });

      // Fetch last seen for offline users
      users
        .filter((user) => user.status === "offline")
        .forEach((user) => updateUserStatus(user.username));
    });

    socket.on("userStatus", async ({ username, status }: UserStatus) => {
      setUserStatuses((prev) => {
        const newMap = new Map(prev);
        // const currentStatus = newMap.get(username);
        newMap.set(username, {
          status,
          lastSeen: status === "offline" ? Date.now() : null,
        });
        return newMap;
      });

      if (status === "offline") {
        updateUserStatus(username);
      }
    });

    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      socket.removeAllListeners();
    };
  }, [currentUsername]);

  const getUserStatus = (username: string): UserStatusState => {
    // Fetch status immediately if we don't have it
    if (!userStatuses.has(username)) {
      updateUserStatus(username);
    }

    return userStatuses.get(username) || { status: "offline", lastSeen: null };
  };

  return {
    socket: socketRef.current,
    isConnected,
    getUserStatus,
    userStatuses,
  };
};
