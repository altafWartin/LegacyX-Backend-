const mongoose = require("mongoose");

const { Schema } = mongoose;

const collection = new Schema(
  {
    name: { type: String, required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Collection", collection, "collections");
