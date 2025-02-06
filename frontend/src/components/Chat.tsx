import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Send } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
// https://www.npmjs.com/package/react-toastify
const socket = io("http://localhost:3000", {
  withCredentials: true
});



const Chat = () => {
  const { username } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Join the room specific to this chat
    socket.emit("joinRoom", { username });
    socket.on("messageError", ({ message }) => {
      


      toast.error(message, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        });



    });

    // Listen for new messages in this specific chat
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load previous messages
    socket.emit("loadMessages", { username });
    socket.on("previousMessages", (previousMessages) => {
      setMessages(previousMessages);
    });

    return () => {
      socket.emit("leaveRoom", { username });
      socket.off("newMessage");
      socket.off("previousMessages");
      socket.off("messageError");
    };
  }, [username]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit("sendMessage", {
        message: inputMessage,
        to: username
      });
      setInputMessage("");
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-[#242033] rounded-lg overflow-hidden p-12">
            <ToastContainer></ToastContainer>
      {/* Chat header */}
      <div className="p-4 bg-[#2a2639] border-b border-[#342f45]">
        <h2 className="text-xl font-semibold">Chat with {username}</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%]  ${msg.sender === username ? "bg-[#E80356] ml-auto" : "bg-[#A3195B] mr-auto"}`}>




            <p className="text-sm text-white"    >{msg.sender}</p>



            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-[#2a2639] border-t border-[#342f45] flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Message ${username}...`}
          className="flex-1 bg-[#1a1625] rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-[#F7374E] hover:bg-purple-700 p-2 rounded-lg transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
