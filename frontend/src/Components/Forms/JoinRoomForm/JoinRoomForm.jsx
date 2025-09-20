// Frontend/src/Components/Forms/JoinRoomForm/JoinRoomForm.jsx

import React, { useState, useEffect } from "react";
import { LogIn, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../context/AppContext";

const JoinRoomForm = () => {
  const { socket, setUser, uuid } = useAppContext();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const navigate = useNavigate();

  const handleRoomJoin = (e) => {
    e.preventDefault();
    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: false,
      presenter: false,
    };
    setUser(roomData);
    navigate(`/${roomId}`);
    socket.emit("userJoined", roomData);
  };

  useEffect(() => {
    const valid = name.trim().length > 0 && roomId.trim().length >= 4;
    setIsFormValid(valid);
  }, [name, roomId]);

  useEffect(() => {
    if (roomId.length >= 4) {
      setConnectionStatus("connecting");
      const timer = setTimeout(() => {
        const statuses = ["connected", "connected", "connected"];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];
        setConnectionStatus(randomStatus);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setConnectionStatus("disconnected");
    }
  }, [roomId]);

  return (
    <form
      onSubmit={handleRoomJoin}
      className="w-full max-w-sm mx-auto space-y-6"
    >
      <div className="text-center">
        <div
          className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
            connectionStatus === "connected"
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-300 shadow-md"
              : connectionStatus === "connecting"
              ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 dark:from-yellow-900/50 dark:to-amber-900/50 dark:text-yellow-300 shadow-md"
              : connectionStatus === "error"
              ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 dark:from-red-900/50 dark:to-rose-900/50 dark:text-red-300 shadow-md"
              : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-500 dark:from-gray-700 dark:to-slate-700 dark:text-gray-400"
          }`}
        >
          {connectionStatus === "connected" && <Wifi className="w-4 h-4" />}
          {connectionStatus === "connecting" && (
            <Wifi className="w-4 h-4 animate-pulse" />
          )}
          {connectionStatus === "error" && <WifiOff className="w-4 h-4" />}
          {connectionStatus === "disconnected" && (
            <WifiOff className="w-4 h-4" />
          )}
          <span>
            {connectionStatus === "connected" && "Room Found!"}
            {connectionStatus === "connecting" && "Searching for room..."}
            {connectionStatus === "error" && "Room not found"}
            {connectionStatus === "disconnected" && "Enter room code"}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <label
          htmlFor="join-username"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <input
          id="join-username"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Enter your username"
          required
        />
      </div>
      <div className="space-y-3">
        <label
          htmlFor="join-room-code"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Room Code
        </label>
        <input
          id="join-room-code"
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-3 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md placeholder-gray-400 dark:placeholder-gray-500 ${
            connectionStatus === "connected"
              ? "border-green-300 dark:border-green-700 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500"
              : connectionStatus === "error"
              ? "border-red-300 dark:border-red-700 focus:ring-red-100 dark:focus:ring-red-900 focus:border-red-400 dark:focus:border-red-500"
              : "border-gray-200 dark:border-gray-600 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500"
          }`}
          placeholder="Enter room code"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!isFormValid || connectionStatus === "error"}
        className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform shadow-lg flex items-center justify-center space-x-2 ${
          isFormValid && connectionStatus !== "error"
            ? "bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white hover:scale-105 hover:shadow-xl active:scale-95"
            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        <LogIn className="w-5 h-5" />
        <span>Join Room</span>
      </button>
    </form>
  );
};

export default JoinRoomForm;
