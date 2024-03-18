const mongoose = require("mongoose");

const { Schema } = mongoose;

const category = new Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", category, "category");
