import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Whiteboard from "../../Components/Whiteboard/Whiteboard";
import { useAppContext } from "../../context/AppContext";
import Chat from "../../Components/Chat/Chat";

const Room = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const { socket, roomState, user } = useAppContext();
  const { roomId } = useParams();

  const hasJoined = useRef(false);
  const [color, setColor] = useState("black");
  const [elements, setElements] = useState([]);
  const [wordLists, setWordLists] = useState([]);
  const [selectedList, setSelectedList] = useState("default");
  const [messages, setMessages] = useState([]);
  const [currentWord, setCurrentWord] = useState("");

  useEffect(() => {
    if (socket && !hasJoined.current) {
      socket.emit("joinRoom", { roomId });
      hasJoined.current = true;
    }
  }, [roomId, socket]);

  useEffect(() => {
    if (roomState) {
      setElements(roomState.drawingElements || []);
      setSelectedList(roomState.activeWordList?._id || "default");

      if (roomState.gameState.status === "in_progress") {
        setCurrentWord(roomState.gameState.wordsForGame?.[0] || "");
      } else {
        setCurrentWord("");
      }
    }
  }, [roomState]);

  useEffect(() => {
    const handleNotification = (data) => {
      setMessages((prev) => [
        ...prev,
        { type: "notification", text: data.message },
      ]);
    };
    if (socket) {
      socket.on("notification", handleNotification);
      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket]);

  // This check is now reliable because the backend always sends a populated `host` object.
  const isHost = user?._id === roomState?.host?._id;

  useEffect(() => {
    const fetchWordLists = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/word-lists`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
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

  const handleWordListChange = (e) => {
    const listId = e.target.value;
    setSelectedList(listId);
    socket.emit("setWordList", { roomId, listId });
  };

  const handleStartGame = () => {
    socket.emit("startGame", { roomId });
  };

  const handleClearCanvas = () => {
    if (isHost) {
      setElements([]);
      socket.emit("whiteboardData", { roomId, elements: [] });
    }
  };

  const handleSendMessage = (messageText) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isCorrect =
      currentWord &&
      messageText.trim().toLowerCase() === currentWord.toLowerCase();

    if (isCorrect) {
      setMessages((prev) => [
        ...prev,
        { type: "correct_guess", name: user.username, timestamp },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { type: "user", name: user.username, text: messageText, timestamp },
      ]);
    }
  };

  if (!roomState) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-slate-900 dark:text-white">
        Connecting to the room...
      </div>
    );
  }

  const renderWordDisplay = () => {
    if (!currentWord || roomState.gameState.status !== "in_progress") {
      return null;
    }
    const display = isHost ? currentWord : currentWord.replace(/\S/g, "_");
    return (
      <div className="text-center font-bold text-3xl tracking-widest text-gray-800 dark:text-white py-4">
        {display.split("").join(" ")}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900 p-2 sm:p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
          Room: <span className="font-mono text-blue-500">{roomId}</span>
        </h1>
        <p className="text-sm dark:text-gray-400">
          Current Word List:{" "}
          <strong>{roomState.activeWordList?.name || "Default"}</strong>
        </p>
      </div>

      <div className="flex justify-center flex-wrap gap-2 sm:gap-4 my-2">
        {roomState.players.map((player) => (
          <div
            key={player.socketId}
            className={`px-3 py-1.5 rounded-lg shadow-sm text-sm font-semibold ${
              // This check is also reliable now.
              player.userId._id === roomState.host._id
                ? "bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100"
                : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            }`}
          >
            {player.name}
            {player.userId._id === roomState.host._id && " (Host) 👑"}
          </div>
        ))}
      </div>

      {isHost && (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 my-4 flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <label className="dark:text-white font-semibold">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border-none bg-transparent cursor-pointer"
            />
          </div>
          {roomState.gameState.status === "waiting" && (
            <div className="flex gap-2 items-center">
              <label className="dark:text-white">Word List:</label>
              <select
                value={selectedList}
                onChange={handleWordListChange}
                className="p-2 rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 border"
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
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Clear
            </button>
            {roomState.gameState.status === "waiting" && (
              <button
                onClick={handleStartGame}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      )}

      {renderWordDisplay()}

      <div className="flex-grow w-full max-w-7xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row gap-4 h-[70vh] md:h-[65vh]">
          <div className="w-full md:w-3/4 h-full min-h-[300px]">
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
          <div className="w-full md:w-1/4 h-full min-h-[400px]">
            <Chat messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
