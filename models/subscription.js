const mongoose = require("mongoose");

const { Schema } = mongoose;

const subscription = new Schema(
    {
        media: { type: mongoose.SchemaTypes.ObjectId, ref: "Media" },
        author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Subscription", subscription, "subscriptions");
