import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';

interface ChatUser {
  username: string;
  profilePic: string;
}

const ChatUserList: React.FC = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_IP}/api/chat/Users_chatedWith`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat users');
        }

        const users: ChatUser[] = await response.json();
        setChatUsers(users);
      } catch (error) {
        toast.error("Failed to load chat users", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);

  return (
    <div className="bg-[#242033] rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-white">Recent Chats</h2>
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <>
            {chatUsers.length === 0 ? (
              <p className="text-gray-400 text-center">No chat history found</p>
            ) : (
              chatUsers.map((user) => (
                <Link
                  key={user.username}
                  to={`/chat/${user.username}`}
                  className="flex items-center p-3 bg-[#2a2639] rounded-lg hover:bg-[#342f45] transition-colors"
                >
                  {Boolean(user.profilePic) ? (
                    <img
                      src={user.profilePic}
                      alt={`${user.username}'s profile`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full bg-[#3a3445] flex items-center justify-center"
                    >
                      <User className="w-6 h-6 text-[#e94057]" />
                    </div>
                  )}
                  <span className="ml-4 text-white">{user.username}</span>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatUserList;