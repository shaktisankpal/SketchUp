import { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Whiteboard from "../../Components/Whiteboard/Whiteboard";
import { useAppContext } from "../../context/AppContext";
import Chat from "../../Components/Chat/Chat";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle";
import { Crown, LogOut, Trash2, Play, Paintbrush } from "lucide-react";

const Room = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const { socket, roomState, user } = useAppContext();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const hasJoined = useRef(false);
  const [color, setColor] = useState("#000000");
  const [elements, setElements] = useState([]);
  const [wordLists, setWordLists] = useState([]);
  const [selectedList, setSelectedList] = useState("default");
  const [messages, setMessages] = useState([]);

  // Join room and handle leaving
  useEffect(() => {
    if (socket && user && !hasJoined.current) {
      socket.emit("joinRoom", { roomId });
      hasJoined.current = true;
    }

    const handleBeforeUnload = () => {
      if (socket) socket.emit("leaveRoom");
    };
    const handlePopState = () => {
      if (socket) socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      if (socket) {
        socket.emit("leaveRoom");
      }
    };
  }, [roomId, socket, user]);

  // Update local state from global roomState
  useEffect(() => {
    if (roomState) {
      setElements(roomState.drawingElements || []);
      setSelectedList(roomState.activeWordList?._id || "default");
    }
  }, [roomState]);

  // Socket listeners for chat and notifications
  useEffect(() => {
    if (!socket) return;
    const getTimestamp = () =>
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const handleNotification = (data) =>
      setMessages((prev) => [
        ...prev,
        { type: "notification", text: data.message, timestamp: getTimestamp() },
      ]);
    const handleReceiveMessage = (data) =>
      setMessages((prev) => [
        ...prev,
        { ...data, type: "user", timestamp: getTimestamp() },
      ]);
    const handleCorrectGuess = (data) =>
      setMessages((prev) => [
        ...prev,
        { ...data, type: "correct_guess", timestamp: getTimestamp() },
      ]);
    socket.on("notification", handleNotification);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("correctGuess", handleCorrectGuess);
    return () => {
      socket.off("notification", handleNotification);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("correctGuess", handleCorrectGuess);
    };
  }, [socket]);

  const { isHost, currentWord, chatStatus } = useMemo(() => {
    const hostId = roomState?.host?._id;
    const _isHost = user?._id === hostId;
    const _currentWord = roomState?.gameState?.currentWord || "";
    const currentPlayer = roomState?.players.find(
      (p) => p.userId._id === user?._id
    );
    let isDisabled = false;
    let reason = "Type your guess...";
    if (roomState?.gameState?.status !== "in_progress") {
      isDisabled = true;
      reason = "The game has not started yet.";
    } else if (_isHost) {
      isDisabled = true;
      reason = "You are the drawer! You cannot guess.";
    } else if (currentPlayer?.hasGuessedCorrectly) {
      isDisabled = true;
      reason = "You already guessed the word!";
    }
    return {
      isHost: _isHost,
      currentWord: _currentWord,
      chatStatus: { isDisabled, reason },
    };
  }, [roomState, user]);

  // Fetch word lists for the host
  useEffect(() => {
    const fetchWordLists = async () => {
      if (!user?.token) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/word-lists`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const data = await response.json();
        setWordLists(data);
      } catch (error) {
        console.error("Failed to fetch word lists:", error);
      }
    };
    if (isHost && roomState?.gameState?.status === "waiting") {
      fetchWordLists();
    }
  }, [isHost, user?.token, roomState?.gameState?.status]);

  // Event handlers
  const handleLeaveRoom = () => {
    if (socket) socket.emit("leaveRoom");
    navigate("/");
  };
  const handleWordListChange = (e) => {
    const listId = e.target.value;
    setSelectedList(listId);
    if (socket) socket.emit("setWordList", { roomId, listId });
  };
  const handleStartGame = () => {
    if (socket) socket.emit("startGame", { roomId });
  };
  const handleClearCanvas = () => {
    if (isHost && socket) {
      setElements([]);
      socket.emit("whiteboardData", { roomId, elements: [] });
    }
  };
  const handleSendMessage = (messageText) => {
    if (socket) socket.emit("sendMessage", { roomId, message: messageText });
  };

  if (!roomState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-white">
        Connecting to the room...
      </div>
    );
  }

  const renderWordDisplay = () => {
    if (!currentWord || roomState.gameState.status !== "in_progress") {
      return (
        <div className="text-center text-xl text-gray-500 dark:text-gray-400 h-12 flex items-center justify-center">
          Waiting for the game to start...
        </div>
      );
    }
    const display = isHost ? currentWord : currentWord.replace(/\S/g, "_");
    return (
      <div className="text-center font-bold text-3xl tracking-[0.3em] text-gray-800 dark:text-white h-12 flex items-center justify-center">
        {display.split("").join(" ")}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 p-2 sm:p-4 flex flex-col items-center">
      <div className="w-full max-w-screen-2xl mx-auto flex flex-col flex-grow">
        {/* Header */}
        <header className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md">
            {/* ✨ FIX: Left side of header now only contains the Room ID */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">
                Room:{" "}
                <span className="font-mono text-blue-500 dark:text-blue-400">
                  {roomId}
                </span>
              </h1>
            </div>

            {/* Middle (Players list) */}
            <div className="flex flex-wrap justify-center items-center gap-2 order-3 sm:order-2 w-full sm:w-auto">
              {roomState.players.map((player) => (
                <div
                  key={player.socketId}
                  className={`px-3 py-1.5 rounded-full shadow-sm text-sm font-semibold flex items-center gap-2 ${
                    player.userId._id === roomState.host._id
                      ? "bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span>
                    {player.name} - {player.score}
                  </span>
                  {player.userId._id === roomState.host._id && (
                    <Crown
                      size={16}
                      className="text-yellow-600 dark:text-yellow-400"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ✨ FIX: Right side of header now groups the buttons together to prevent overlap */}
            <div className="flex items-center gap-3 order-2 sm:order-3">
              <ThemeToggle position="static" />
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-semibold"
              >
                <LogOut size={18} /> Leave
              </button>
            </div>
          </div>
        </header>

        {/* Word Display */}
        {renderWordDisplay()}

        {/* Host Controls */}
        {isHost && (
          <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 my-2 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <label
                htmlFor="color-picker"
                className="font-semibold flex items-center gap-2"
              >
                <Paintbrush size={18} /> Color:
              </label>
              <input
                id="color-picker"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 border-none bg-transparent cursor-pointer"
              />
            </div>
            {roomState.gameState.status === "waiting" && (
              <div className="flex gap-2 items-center">
                <label className="font-semibold">Word List:</label>
                <select
                  value={selectedList}
                  onChange={handleWordListChange}
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border"
                >
                  <option value="default">Default Words</option>
                  {wordLists.map((list) => (
                    <option key={list._id} value={list._id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={handleClearCanvas}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} /> Clear
              </button>
              {roomState.gameState.status === "waiting" && (
                <button
                  onClick={handleStartGame}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <Play size={16} /> Start Game
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Game Area */}
        <main className="flex-grow w-full mt-2">
          <div className="flex flex-col md:flex-row gap-4 h-full md:h-[calc(100vh-280px)] min-h-[500px]">
            <div className="w-full md:w-3/4 h-[50vh] md:h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
              <Whiteboard
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                elements={elements}
                setElements={setElements}
                color={color}
                canDraw={isHost}
                roomId={roomId}
              />
            </div>
            <div className="w-full md:w-1/4 h-[50vh] md:h-full">
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isDisabled={chatStatus.isDisabled}
                placeholder={chatStatus.reason}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Room;
