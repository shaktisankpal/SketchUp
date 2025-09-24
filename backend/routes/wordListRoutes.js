const express = require("express");
const router = express.Router();
const {
  createWordList,
  getWordListsByUser,
  updateWordList,
  deleteWordList,
} = require("../controllers/wordListController");
const { protect } = require("../middleware/authMiddleware"); // ✨ IMPORT arotect middleware

// ✨ ALL routes are now protected and require a valid JWT
router
  .route("/")
  .post(protect, createWordList)
  .get(protect, getWordListsByUser);

router
  .route("/:listId")
  .put(protect, updateWordList)
  .delete(protect, deleteWordList);

module.exports = router;
