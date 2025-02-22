import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  currentUsername: string;
}

interface UserStatus {
  username: string;
  status: 'online' | 'offline';
}

export const useSocket = ({ currentUsername }: UseSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Map<string, 'online' | 'offline'>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(import.meta.env.VITE_BACKEND_IP, {
      withCredentials: true,
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle initial online users list
    socket.on('onlineUsers', (users: UserStatus[]) => {
      const statusMap = new Map(users.map(user => [user.username, user.status]));
      setUserStatuses(statusMap);
    });

    // Handle individual user status updates
    socket.on('userStatus', ({ username, status }: UserStatus) => {
      setUserStatuses(prev => {
        const newMap = new Map(prev);
        newMap.set(username, status);
        return newMap;
      });
    });

    // Send heartbeat every 15 seconds
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      // socket.disconnect();
    };
  }, [currentUsername]);

  const getUserStatus = (username: string) => {
    if (!socketRef.current) return 'offline';
    socketRef.current.emit('getUserStatus', username);
    return userStatuses.get(username) || 'offline';
  };

  return {
    socket: socketRef.current,
    isConnected,
    getUserStatus,
    userStatuses
  };
};