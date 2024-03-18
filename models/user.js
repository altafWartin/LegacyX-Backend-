const { required } = require("joi");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    profileImage: { type: String, required: false },
    device_tokens: { type: String }, // Changed to array of strings
    coverImage: { type: String, required: false },
    email: { type: String, required: true },
    verified: { type: Boolean, required: true },
    promoCode: { type: String, required: false },
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    stripe_customer_id: { type: String },
    subscribed: [{ type: String }],
    isSubscribed: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema, "users");
