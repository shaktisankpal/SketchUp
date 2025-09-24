const WordList = require("../models/WordList");
const Room = require("../models/Room");

// @desc    Create a new word list
// @route   POST /api/v1/word-lists
const createWordList = async (req, res) => {
  try {
    // ✨ UPDATED: createdBy now comes from the authenticated user middleware
    const { name, words } = req.body;
    const createdBy = req.user.id;

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

// @desc    Get all word lists for the logged-in user
// @route   GET /api/v1/word-lists
const getWordListsByUser = async (req, res) => {
  try {
    // ✨ UPDATED: userId comes from authenticated user
    const lists = await WordList.find({ createdBy: req.user.id });
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

    const list = await WordList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Word list not found." });
    }
    // ✨ SECURITY: Ensure the user owns this list
    if (list.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized." });
    }

    const updatedList = await WordList.findByIdAndUpdate(
      listId,
      { name, words },
      { new: true, runValidators: true }
    );

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
    const list = await WordList.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "Word list not found." });
    }
    // ✨ SECURITY: Ensure the user owns this list
    if (list.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized." });
    }
    await WordList.findByIdAndDelete(listId);
    res.status(200).json({ message: "Word list deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Note: setRoomWordList can be removed from here and handled purely via Socket.IO
// for better real-time updates. The socket version is already in server.js

module.exports = {
  createWordList,
  getWordListsByUser,
  updateWordList,
  deleteWordList,
};
