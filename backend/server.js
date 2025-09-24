const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const Room = require("./models/Room");
const User = require("./models/User");
const WordList = require("./models/WordList");
const jwt = require("jsonwebtoken");

// Import routes
const wordListRoutes = require("./routes/wordListRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// API ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/word-lists", wordListRoutes);
app.get("/", (req, res) => {
  res.send("hello world from skribbl backend");
});

// SOCKET.IO AUTHENTICATION MIDDLEWARE
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided."));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Authentication error: User not found."));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token."));
  }
});

// ✨ NEW: Centralized function to get a fully populated, consistent room state.
const getAuthoritativeRoomState = async (roomId) => {
  return await Room.findOne({ roomId })
    .populate("activeWordList", "name")
    .populate("host", "username")
    .populate("players.userId", "username");
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  // --- USER JOINING LOGIC ---
  socket.on("joinRoom", async ({ roomId }) => {
    try {
      socket.join(roomId);
      const newPlayer = {
        userId: socket.user._id,
        name: socket.user.username,
        socketId: socket.id,
      };
      let room = await Room.findOne({ roomId });

      if (room) {
        if (!room.players.some((p) => p.userId.equals(socket.user._id))) {
          room.players.push(newPlayer);
        }
      } else {
        room = new Room({
          roomId,
          players: [newPlayer],
          host: socket.user._id,
        });
      }

      await room.save();

      // ✨ FIXED: Use the centralized function to ensure consistent data shape.
      const updatedRoom = await getAuthoritativeRoomState(roomId);

      io.to(roomId).emit("updateRoomState", updatedRoom);
      socket.broadcast.to(roomId).emit("notification", {
        message: `${socket.user.username} has joined the game.`,
      });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Could not join the room." });
    }
  });

  // --- HOST-ONLY ACTIONS ---
  socket.on("setWordList", async ({ roomId, listId }) => {
    try {
      let room = await Room.findOne({ roomId });
      if (room && room.host.equals(socket.user._id)) {
        room.activeWordList = listId === "default" ? null : listId;
        await room.save();

        // ✨ FIXED: Use the centralized function.
        const updatedRoom = await getAuthoritativeRoomState(roomId);
        io.to(roomId).emit("updateRoomState", updatedRoom);
      }
    } catch (error) {
      console.error("Error setting word list:", error);
    }
  });

  socket.on("startGame", async ({ roomId }) => {
    try {
      let room = await Room.findOne({ roomId });
      if (room && room.host.equals(socket.user._id)) {
        let wordsForGame = [];
        if (room.activeWordList) {
          const wordList = await WordList.findById(room.activeWordList);
          wordsForGame = wordList ? [...wordList.words] : [];
        }

        if (wordsForGame.length === 0) {
          wordsForGame = ["Cat", "Dog", "Sun", "House", "Tree", "Car"];
        }

        room.gameState.wordsForGame = wordsForGame.sort(
          () => Math.random() - 0.5
        );
        room.gameState.status = "in_progress";
        room.gameState.currentRound = 1;

        await room.save();

        // ✨ FIXED: Use the centralized function to send the populated state.
        const updatedRoom = await getAuthoritativeRoomState(roomId);
        io.to(roomId).emit("updateRoomState", updatedRoom);

        io.to(roomId).emit("notification", {
          message: "The game has started!",
        });
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  });

  // --- DRAWING LOGIC ---
  socket.on("startDrawing", ({ roomId, element }) => {
    socket.broadcast.to(roomId).emit("startDrawing", element);
  });

  socket.on("drawMove", ({ roomId, newPath }) => {
    socket.broadcast.to(roomId).emit("drawMove", newPath);
  });

  socket.on("whiteboardData", async ({ roomId, elements }) => {
    try {
      await Room.updateOne({ roomId }, { $set: { drawingElements: elements } });

      // ✨ FIXED: Use the centralized function after updating.
      const updatedRoom = await getAuthoritativeRoomState(roomId);
      if (updatedRoom) {
        io.to(roomId).emit("updateRoomState", updatedRoom);
      }
    } catch (error) {
      console.error("Error updating whiteboard data:", error);
    }
  });

  // --- USER DISCONNECTING LOGIC ---
  socket.on("disconnect", async () => {
    try {
      let room = await Room.findOne({ "players.socketId": socket.id });
      if (room) {
        const playerName = socket.user.username || "A player";

        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          room.isActive = false;
        } else if (room.host.equals(socket.user._id)) {
          room.host = room.players[0].userId;
        }

        await room.save();

        if (room.isActive) {
          // ✨ FIXED: Use the centralized function.
          const updatedRoom = await getAuthoritativeRoomState(room.roomId);
          io.to(room.roomId).emit("updateRoomState", updatedRoom);
          io.to(room.roomId).emit("notification", {
            message: `${playerName} has left the game.`,
          });
        }
      }
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
