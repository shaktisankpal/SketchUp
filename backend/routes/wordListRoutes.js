const express = require("express");
const router = express.Router();
const {
  createWordList,
  getWordListsByUser,
  updateWordList,
  deleteWordList,
  setRoomWordList,
} = require("../controllers/wordListController");

// Routes for managing word lists
router.post("/", createWordList);
router.get("/user/:userId", getWordListsByUser);
router.put("/:listId", updateWordList);
router.delete("/:listId", deleteWordList);

// Route for setting a room's active word list
router.put("/room/:roomId", setRoomWordList);

module.exports = router;
