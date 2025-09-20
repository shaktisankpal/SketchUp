const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  score: { type: Number, default: 0 },
  hasGuessedCorrectly: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    host: { type: String },
    players: [playerSchema],
    isPrivate: { type: Boolean, default: false },
    // ✨ NEW: Reference to the selected WordList for the game
    activeWordList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WordList",
      default: null,
    },
    gameSettings: {
      rounds: { type: Number, default: 3 },
      drawTime: { type: Number, default: 80 },
      maxPlayers: { type: Number, default: 8 },
    },
    gameState: {
      status: { type: String, default: "waiting" },
      currentRound: { type: Number, default: 1 },
      currentWord: { type: String, default: "" },
      currentDrawer: { type: String },
      // ✨ NEW: Holds the words for the current game session
      wordsForGame: { type: [String], default: [] },
    },
    drawingElements: { type: Array },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
