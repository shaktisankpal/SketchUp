import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle, Info } from "lucide-react";

// Helper function to get a consistent color from a string (for avatars)
const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// Sub-component for rendering different message types
const Message = ({ msg }) => {
  const { type, name, text, timestamp } = msg;

  if (type === "notification") {
    return (
      <div className="text-center my-2">
        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
          <Info size={12} className="inline-block mr-1" />
          {text}
        </span>
      </div>
    );
  }

  if (type === "correct_guess") {
    return (
      <div className="text-center my-2">
        <span className="px-3 py-1 text-sm font-semibold text-green-800 dark:text-green-100 bg-green-200 dark:bg-green-700 rounded-full">
          <CheckCircle size={14} className="inline-block mr-1.5" />
          {name} guessed the word!
        </span>
      </div>
    );
  }

  // Default user message
  return (
    <li className="flex items-start gap-3 my-3">
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
            {name}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {timestamp}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg p-2.5 text-sm mt-1">
          {text}
        </p>
      </div>
    </li>
  );
};

const Chat = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
      <div className="p-3 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">
          Guess Box
        </h2>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        <ul>
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>
      <div className="p-3 border-t dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your guess..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-shadow"
          />
          <button
            type="submit"
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex-shrink-0 disabled:bg-gray-400"
            disabled={!message.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
