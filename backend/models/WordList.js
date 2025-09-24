const mongoose = require("mongoose");

const wordListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    words: {
      type: [String],
      required: true,
      validate: [
        (val) => val.length > 0,
        "A word list must contain at least one word.",
      ],
    },
    // ✨ UPDATED: createdBy now references the User model
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WordList = mongoose.model("WordList", wordListSchema);
module.exports = WordList;
