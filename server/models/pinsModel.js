const mongoose = require("mongoose");

const PinsSchema = mongoose.Schema(
  {
    content: String,
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
    },
    time: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "code", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pins", PinsSchema);
