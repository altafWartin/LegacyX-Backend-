const { required } = require("joi");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    uid: { type: String },
    username: { type: String },
    password: { type: String },
    otp: { type: String },
    device_tokens: { type: String },
    profileImage: { type: String },
    coverImage: { type: String },
    email: { type: String },
    isBlocked: Boolean,
    verified: { type: Boolean },
    promoCode: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    stripe_customer_id: { type: String },
    subscribed: [{ type: String }],
    isSubscribed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema, "users");
