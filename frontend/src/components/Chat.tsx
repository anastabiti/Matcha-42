import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import sortBy from "lodash/sortBy";
import socket from "./Socket";

interface Message {
  content: string;
  createdAt: number;
  sender: string;
  receiver: string;
  date: string;
}

// export const socket = io(`${import.meta.env.VITE_BACKEND_IP}`, {
//   withCredentials: true,
// });

const Chat = () => {
  const { username } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_IP
          }/api/chat/get_messages/${username}`,
          {
            credentials: "include"
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const oldMessages: Message[] = await response.json();
        const sorted_messages = await sortBy(oldMessages, ["createdAt"]);
        if (sorted_messages.length > 0) {
          setMessages(sorted_messages);
        }
      } catch (error) {
        toast.error("Failed to load previous messages", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        });
      }
    };

    fetchMessages();
  }, [username]);

  useEffect(() => {
    socket.emit("joinRoom", { username });
    socket.emit("openChat", username);

    socket.on("messageError", ({ message }) => {
      toast.error(message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });
    });

    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit("leaveRoom", { username });
      socket.emit("closeChat");
      socket.off("newMessage");
      socket.off("previousMessages");
      socket.off("messageError");
    };
  }, [username]);

  const sendMessage = (e:any) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit("sendMessage", {
        message: inputMessage,
        to: username
      });
      setInputMessage("");
    }
  };

  useEffect(() => {
    //ensures that a chat window automatically scrolls to the bottom whenever new messages are added
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      /*
      scrollHeight: The total height of the scrollable content, including content not visible
    scrollTop: The number of pixels that the content has been scrolled up
    Setting scrollTop equal to scrollHeight moves the scroll position to the bottom
*/
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]); // run whenever messages change

  return (
    <div className="flex flex-col h-screen sm:h-[80vh] bg-[#242033] rounded-2xl overflow-hidden p-8 mt-32 sm:p-4 md:p-16 ">
      <ToastContainer />

      {/* Chat header */}
      <div className="p-14 sm:p-4 bg-[#2a2639] border-b border-[#342f45]">
        <h2 className="text-lg sm:text-xl font-semibold truncate">
          Chat with {username}
        </h2>
      </div>

      <div
        id="chat-messages"
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4"
        /*overflow-y-auto
         When an element’s content exceeds its vertical boundaries (i.e., it’s taller than the element’s set height), 
         this setting automatically displays a vertical scrollbar.
        */
         style={{
          //https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
          scrollBehavior: "smooth"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 sm:p-3 rounded-lg max-w-[90%] sm:max-w-[80%] ${
              msg.sender === username
                ? "bg-[#E80356] ml-auto"
                : "bg-[#A3195B] mr-auto"
            }`}
            style={{ scrollSnapAlign: "end" }}
          >
            <p className="text-xs sm:text-sm text-white">{msg.sender}</p>
            <p className="break-words whitespace-normal text-gray-50 ext-base">
              {msg.content}
            </p>
          </div>
        ))}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="p-2 sm:p-4 bg-[#2a2639] border-t border-[#342f45] flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          minLength={1}
          maxLength={300}
          placeholder={`Message ${username}...`}
          className="flex-1 bg-[#1a1625] rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-[#F7374E] hover:bg-purple-700 p-1 sm:p-2 rounded-lg transition-colors"
        >
          <Send size={16} className="sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
