import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../../Components/Navbar/Navbar";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle"; // ✨ Import ThemeToggle

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createNewRoom = () => {
    const newRoomId = uuidv4().substring(0, 8);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      return alert("Please enter a Room ID.");
    }
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 p-4">
      <Navbar />
      <ThemeToggle position="top-left" /> {/* ✨ Added to the top-left */}
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            The Drawing Game
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create a room or join a friend's!
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/word-lists")}
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
          >
            Manage My Word Lists
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Join or Create a Room
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Room ID to Join"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md"
          />
          <button
            onClick={joinRoom}
            className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Join Room
          </button>
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400">OR</div>

        <button
          onClick={createNewRoom}
          className="w-full px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600"
        >
          Create a New Room
        </button>
      </div>
    </div>
  );
};

export default Home;
