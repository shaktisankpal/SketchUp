import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../../Components/Navbar/Navbar";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle";
import {
  PenSquare,
  Users,
  MessagesSquare,
  MousePointerClick,
  Check,
  X,
  Heart,
  BookOpen,
} from "lucide-react";

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
    <div className="relative min-h-screen w-full bg-gray-100 dark:bg-slate-900 p-4 sm:p-8 overflow-x-hidden">
      <Navbar />
      <ThemeToggle position="top-left" />

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white">
          Welcome to SketchUp!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          The real-time drawing and guessing game.
        </p>
      </div>

      {/* ✨ New three-column grid layout for larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
        {/* ✨ How to Play Section (Left Column) */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" />
            How to Play
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <PenSquare className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Create or Join</h3>
                <p className="text-sm">
                  Start a new room and invite your friends, or join an existing
                  room using a Room ID.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MousePointerClick className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Draw the Word</h3>
                <p className="text-sm">
                  If you're the artist, choose a word and do your best to draw
                  it on the canvas.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MessagesSquare className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Guess the Word</h3>
                <p className="text-sm">
                  If you're guessing, type your answers in the chat. The faster
                  you guess, the more points you get!
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* ✨ Main Form (Center Column) */}
        <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 mx-auto">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Get Started
            </h2>
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
                Join or Create
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

        {/* ✨ Rules Section (Right Column) */}
        <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white flex items-center justify-center gap-2">
            <Check className="w-6 h-6" />
            Rules
          </h2>
          <ul className="space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">No Text or Numbers</h3>
                <p className="text-sm">
                  Do not write letters, numbers, or symbols while drawing. Let
                  your art do the talking!
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Be Respectful</h3>
                <p className="text-sm">
                  Keep your drawings and guesses appropriate and friendly. No
                  offensive content.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Have Fun!</h3>
                <p className="text-sm">
                  The goal is to have a great time with friends. Don't take it
                  too seriously and enjoy the game!
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
