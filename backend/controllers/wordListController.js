const WordList = require("../models/WordList");
const Room = require("../models/Room");

// @desc    Create a new word list
// @route   POST /api/v1/word-lists
const createWordList = async (req, res) => {
  try {
    // In a real app, createdBy would come from an authenticated user (req.user.id)
    const { name, words, createdBy } = req.body;

    if (!name || !words || !createdBy || words.length === 0) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newList = new WordList({ name, words, createdBy });
    await newList.save();
    res.status(201).json(newList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all word lists for a "user"
// @route   GET /api/v1/word-lists/:userId
const getWordListsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await WordList.find({ createdBy: userId });
    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a word list
// @route   PUT /api/v1/word-lists/:listId
const updateWordList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name, words } = req.body;

    const updatedList = await WordList.findByIdAndUpdate(
      listId,
      { name, words },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      return res.status(404).json({ message: "Word list not found." });
    }
    res.status(200).json(updatedList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a word list
// @route   DELETE /api/v1/word-lists/:listId
const deleteWordList = async (req, res) => {
  try {
    const { listId } = req.params;
    const deletedList = await WordList.findByIdAndDelete(listId);
    if (!deletedList) {
      return res.status(404).json({ message: "Word list not found." });
    }
    res.status(200).json({ message: "Word list deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Set the active word list for a room
// @route   PUT /api/v1/rooms/:roomId/word-list
const setRoomWordList = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { listId, userId } = req.body; // userId is temporary for host check

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // This is a simplified host check. In a real app, you'd use socketId or a userId from auth.
    // For now, we are trusting the client.
    // if (room.host !== userId) {
    //   return res.status(403).json({ message: "Only the host can change the word list." });
    // }

    room.activeWordList = listId === "default" ? null : listId;
    await room.save();

    // We don't emit here, we let the client refetch state or we can build a socket event for it.
    // For simplicity, we just send a success response. The frontend will know.
    const updatedRoom = await Room.findOne({ roomId }).populate(
      "activeWordList",
      "name"
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createWordList,
  getWordListsByUser,
  updateWordList,
  deleteWordList,
  setRoomWordList,
};
