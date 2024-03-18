const mongoose = require("mongoose");

const { Schema } = mongoose;

const media = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    path: { type: String, required: true },
    entityType: { type: String, required: true },
    tags: { type: String },
    caption: { type: String },
    likes: { type: Number },
    shares: { type: Number },
    category: { type: mongoose.SchemaTypes.ObjectId, ref: "Category" },
    visibility: { type: Boolean, required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    collections: { type: mongoose.SchemaTypes.ObjectId, ref: "Collection" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Media", media, "medias");
