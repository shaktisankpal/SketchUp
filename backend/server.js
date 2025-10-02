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

// Centralized function to get a fully populated, consistent room state.
const getAuthoritativeRoomState = async (roomId) => {
  return await Room.findOne({ roomId })
    .populate("activeWordList", "name")
    .populate("host", "username")
    .populate("players.userId", "username");
};

// Function to get and broadcast the list of active rooms to the lobby
const broadcastActiveRooms = async () => {
  try {
    // Find rooms that are active and have at least one player
    const activeRooms = await Room.find({
      isActive: true,
      "players.0": { $exists: true },
    }).select("roomId players gameSettings"); // Select only needed fields

    // Send the list to everyone in the 'lobby' room
    io.to("lobby").emit("update-active-rooms", activeRooms);
  } catch (error) {
    console.error("Error broadcasting active rooms:", error);
  }
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  // --- LOBBY LOGIC ---
  socket.on("joinLobby", () => {
    socket.join("lobby");
    // Immediately send the current list to the user who just joined the lobby
    broadcastActiveRooms();
  });

  socket.on("leaveLobby", () => {
    socket.leave("lobby");
  });

  // --- USER JOINING A GAME ROOM LOGIC ---
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
        // Rejoin logic or add new player
        const playerIndex = room.players.findIndex((p) =>
          p.userId.equals(socket.user._id)
        );
        if (playerIndex > -1) {
          room.players[playerIndex].socketId = socket.id; // Update socket ID on reconnect
        } else {
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

      const updatedRoom = await getAuthoritativeRoomState(roomId);
      io.to(roomId).emit("updateRoomState", updatedRoom);
      socket.broadcast.to(roomId).emit("notification", {
        message: `${socket.user.username} has joined the game.`,
      });

      // After a user joins a room, update the lobby list for everyone else
      broadcastActiveRooms();
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
      // Only host can start the game
      if (room && room.host.equals(socket.user._id)) {
        let wordsForGame = [];
        if (room.activeWordList) {
          const wordList = await WordList.findById(room.activeWordList);
          wordsForGame = wordList ? [...wordList.words] : [];
        }

        // Default words if no list is selected or list is empty
        if (wordsForGame.length === 0) {
          wordsForGame = ["Cat", "Dog", "Sun", "House", "Tree", "Car"];
        }

        // Reset player states for the new game
        room.players.forEach((p) => {
          p.score = 0;
          p.hasGuessedCorrectly = false;
        });

        // Set game state
        room.gameState.wordsForGame = wordsForGame.sort(
          () => Math.random() - 0.5
        );
        room.gameState.status = "in_progress";
        room.gameState.currentRound = 1;
        room.gameState.currentWord = room.gameState.wordsForGame[0] || ""; // Set first word
        room.drawingElements = []; // Clear canvas

        await room.save();

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

  // --- CHAT LOGIC ---
  socket.on("sendMessage", async ({ roomId, message }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room || room.gameState.status !== "in_progress") {
        return; // Can't chat if game isn't running
      }

      const player = room.players.find((p) => p.userId.equals(socket.user._id));

      // Prevent host or people who already guessed from guessing again
      if (
        !player ||
        player.hasGuessedCorrectly ||
        room.host.equals(socket.user._id)
      ) {
        return;
      }

      const isCorrect =
        message.trim().toLowerCase() ===
        room.gameState.currentWord.toLowerCase();

      if (isCorrect) {
        player.hasGuessedCorrectly = true;
        player.score += 100; // Basic scoring
        await room.save();

        io.to(roomId).emit("correctGuess", { name: player.name });

        const updatedRoom = await getAuthoritativeRoomState(roomId);
        io.to(roomId).emit("updateRoomState", updatedRoom);
      } else {
        // Broadcast regular message
        io.to(roomId).emit("receiveMessage", {
          name: player.name,
          text: message,
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
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
      // Only host can update whiteboard data
      const room = await Room.findOne({ roomId });
      if (room && room.host.equals(socket.user._id)) {
        await Room.updateOne(
          { roomId },
          { $set: { drawingElements: elements } }
        );

        // ✨ FIX: Broadcast the updated state to all clients in the room
        // This ensures everyone's whiteboard is synchronized after each stroke.
        const updatedRoom = await getAuthoritativeRoomState(roomId);
        if (updatedRoom) {
          io.to(roomId).emit("updateRoomState", updatedRoom);
        }
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
          room.isActive = false; // Make room inactive if empty
        } else if (room.host.equals(socket.user._id)) {
          // If host leaves, assign a new host
          room.host = room.players[0].userId;
        }

        await room.save();

        if (room.isActive) {
          const updatedRoom = await getAuthoritativeRoomState(room.roomId);
          io.to(room.roomId).emit("updateRoomState", updatedRoom);
          io.to(room.roomId).emit("notification", {
            message: `${playerName} has left the game.`,
          });
        }

        // After a user disconnects, update the lobby list
        broadcastActiveRooms();
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
