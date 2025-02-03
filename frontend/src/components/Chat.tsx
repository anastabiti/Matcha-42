import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';

const socket = io('http://localhost:3000',
  { 
    withCredentials: true, 
  }
);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);



  useEffect(() => {
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  useEffect(() => {
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      socket.emit('sendMessage', { message: inputMessage });
      setInputMessage('');
    }
  };

  return (
    // https://tailwindcss.com/docs/flex-direction#column-reversed
    <div className="flex flex-col h-[80vh] bg-[#242033] rounded-lg overflow-hidden p-12">
      {/* Chat header */}
      <div className="p-4 bg-[#2a2639] border-b border-[#342f45]">
        <h2 className="text-xl font-semibold">Chat Room</h2>
      </div>

      {/* Messages container */}
      <div className="flex-col overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className="bg-[#2f2a3e] p-3 rounded-lg max-w-[80%]"
          >
            <p>{msg.content}</p>
        
          </div>
        ))}
        <div ref={messagesEndRef} />
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
          placeholder="Type a message..."
          className="flex-1 bg-[#1a1625] rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 p-2 rounded-lg transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;