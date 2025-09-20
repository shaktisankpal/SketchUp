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
      // Add a validator to ensure the list is not empty
      validate: [
        (val) => val.length > 0,
        "A word list must contain at least one word.",
      ],
    },
    // For now, we'll assume no user model and just store a generic creator ID.
    // In a full app, this would be: createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const WordList = mongoose.model("WordList", wordListSchema);
module.exports = WordList;
