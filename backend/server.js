const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS
const connectDB = require("./config/db");
const Room = require("./models/Room");
const WordList = require("./models/WordList"); // Import WordList model
const wordListRoutes = require("./routes/wordListRoutes"); // Import routes

dotenv.config();
connectDB();

const app = express();

// ✨ MIDDLEWARE
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing for REST APIs

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO
    methods: ["GET", "POST"],
  },
});

// ✨ API ROUTES
app.use("/api/v1/word-lists", wordListRoutes);
app.get("/", (req, res) => {
  res.send("hello world from skribbl backend");
});

io.on("connection", (socket) => {
  // --- USER JOINING LOGIC ---
  socket.on("joinRoom", async ({ name, roomId }) => {
    try {
      socket.join(roomId);
      const newPlayer = { name, socketId: socket.id };
      let room = await Room.findOne({ roomId });

      if (room) {
        room.players.push(newPlayer);
      } else {
        room = new Room({
          roomId,
          players: [newPlayer],
          host: socket.id,
        });
      }

      await room.save();
      // Populate the activeWordList to get its name
      const updatedRoom = await Room.findOne({ roomId }).populate(
        "activeWordList",
        "name"
      );

      io.to(roomId).emit("updateRoomState", updatedRoom);
      socket.broadcast
        .to(roomId)
        .emit("notification", { message: `${name} has joined the game.` });
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Could not join the room." });
    }
  });

  // ✨ NEW SOCKET EVENT: Host changes word list
  socket.on("setWordList", async ({ roomId, listId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room && room.host === socket.id) {
        room.activeWordList = listId === "default" ? null : listId;
        await room.save();

        const updatedRoom = await Room.findOne({ roomId }).populate(
          "activeWordList",
          "name"
        );
        io.to(roomId).emit("updateRoomState", updatedRoom);
      }
    } catch (error) {
      console.error("Error setting word list:", error);
    }
  });

  // --- GAME LOGIC ---
  socket.on("startGame", async ({ roomId }) => {
    try {
      let room = await Room.findOne({ roomId });
      if (room && room.host === socket.id) {
        // Fetch words for the game
        let wordsForGame = [];
        if (room.activeWordList) {
          const wordList = await WordList.findById(room.activeWordList);
          wordsForGame = wordList ? [...wordList.words] : [];
        }

        // Fallback to default words if no custom list or list is empty
        if (wordsForGame.length === 0) {
          wordsForGame = ["Cat", "Dog", "Sun", "House", "Tree", "Car"]; // Default words
        }

        // Shuffle words and save to room state
        room.gameState.wordsForGame = wordsForGame.sort(
          () => Math.random() - 0.5
        );
        room.gameState.status = "in_progress";
        room.gameState.currentRound = 1;

        await room.save();

        // Start the first round (you would have more complex logic here)
        io.to(roomId).emit("updateRoomState", room);
        io.to(roomId).emit("notification", {
          message: "The game has started!",
        });
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  });

  // Drawing logic remains the same...

  // --- LIVE DRAWING CHANNELS (HIGH-SPEED) ---
  socket.on("startDrawing", ({ roomId, element }) => {
    socket.broadcast.to(roomId).emit("startDrawing", element);
  });

  socket.on("drawMove", ({ roomId, newPath }) => {
    socket.broadcast.to(roomId).emit("drawMove", newPath);
  });

  socket.on("whiteboardData", async ({ roomId, elements }) => {
    try {
      const updatedRoom = await Room.findOneAndUpdate(
        { roomId },
        { $set: { drawingElements: elements } },
        { new: true }
      ).populate("activeWordList", "name");
      if (updatedRoom) {
        socket.broadcast.to(roomId).emit("updateRoomState", updatedRoom);
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
        const disconnectedPlayer = room.players.find(
          (p) => p.socketId === socket.id
        );
        const playerName = disconnectedPlayer
          ? disconnectedPlayer.name
          : "A player";

        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          room.isActive = false;
          room.drawingElements = [];
        } else if (room.host === socket.id) {
          room.host = room.players[0].socketId;
        }

        await room.save();
        const updatedRoom = await Room.findOne({
          roomId: room.roomId,
        }).populate("activeWordList", "name");

        if (updatedRoom && updatedRoom.isActive) {
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
