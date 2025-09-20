// Frontend/src/Components/Forms/Form.jsx

import React, { useState, useEffect } from "react";
import JoinRoomForm from "./JoinRoomForm/JoinRoomForm.jsx";
import CreateRoomForm from "./CreateRoomForm/CreateRoomForm.jsx";
import { Users, LogIn, Clock, Sparkles } from "lucide-react";

const Form = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeTracker = setInterval(
      () => setTimeSpent((prev) => prev + 1),
      1000
    );
    return () => clearInterval(timeTracker);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 py-12 px-4 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 dark:opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-gray-100 dark:via-blue-300 dark:to-purple-400 bg-clip-text text-transparent mb-6 pb-2">
            Room Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
            Create a new room or join an existing one to start collaborating
            with your team
          </p>
          <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-full">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Current Time
                  </div>
                  <div className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                    {formatTime(currentTime)}
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
              <div className="flex items-center space-x-3 text-purple-600 dark:text-purple-400">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-full">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Session Time
                  </div>
                  <div className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                    {formatDuration(timeSpent)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="group">
            <div className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-10 hover:shadow-3xl transition-all duration-500 hover:scale-105 transform">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Create Room
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Start a new room and invite others to join
                </p>
              </div>
              <CreateRoomForm />
            </div>
          </div>
          <div className="group">
            <div className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-10 hover:shadow-3xl transition-all duration-500 hover:scale-105 transform">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Join Room
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Enter a room code to connect with others
                </p>
              </div>
              <JoinRoomForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
