// Frontend/src/Components/Forms/CreateRoomForm/CreateRoomForm.jsx

import React, { useState, useEffect } from "react";
import { Copy, RefreshCw, Users, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";

const CreateRoomForm = () => {
  const { socket, setUser, uuid } = useAppContext();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState(uuid());
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: true,
      presenter: true,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  const generateRoomId = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setRoomId(uuid());
      setIsGenerating(false);
    }, 500);
  };

  const copyRoomId = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess(true);
    }
  };

  useEffect(() => {
    setIsFormValid(name.trim().length > 0 && roomId.trim().length > 0);
    if (name.trim().length > 0) {
      setWelcomeMessage(`Welcome, ${name}! 👋`);
    } else {
      setWelcomeMessage("");
    }
  }, [name, roomId]);

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  return (
    <form
      onSubmit={handleCreateRoom}
      className="w-full max-w-sm mx-auto space-y-6"
    >
      {welcomeMessage && (
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border border-blue-200 dark:border-blue-800 rounded-xl transition-all duration-300 shadow-sm">
          <p className="text-blue-700 dark:text-blue-300 font-medium flex items-center justify-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>{welcomeMessage}</span>
          </p>
        </div>
      )}
      <div className="space-y-3">
        <label
          htmlFor="create-username"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <input
          id="create-username"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Enter your username"
          required
        />
      </div>
      <div className="space-y-3">
        <label
          htmlFor="room-id"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Room ID
        </label>
        <div className="relative">
          <input
            id="room-id"
            type="text"
            value={roomId}
            readOnly
            className="w-full px-4 py-3.5 pr-24 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md placeholder-gray-400"
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <button
              type="button"
              onClick={generateRoomId}
              disabled={isGenerating}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50"
              title="Generate New ID"
            >
              <RefreshCw
                className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={copyRoomId}
              disabled={!roomId}
              className={`p-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${
                copySuccess
                  ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-gray-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-gray-600"
              }`}
              title={copySuccess ? "Copied!" : "Copy ID"}
            >
              {copySuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform shadow-lg flex items-center justify-center space-x-2 ${
          isFormValid
            ? "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white hover:scale-105 hover:shadow-xl active:scale-95"
            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        <Users className="w-5 h-5" />
        <span>Create Room</span>
      </button>
    </form>
  );
};

export default CreateRoomForm;
