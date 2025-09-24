const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  // ✨ UPDATED: Link player to the User model
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  score: { type: Number, default: 0 },
  hasGuessedCorrectly: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    // ✨ UPDATED: Host is now a reference to the User model
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    players: [playerSchema],
    isPrivate: { type: Boolean, default: false },
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
      currentDrawer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      wordsForGame: { type: [String], default: [] },
    },
    drawingElements: { type: Array },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
