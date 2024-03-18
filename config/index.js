const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 4400;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb+srv://legacyempire1:Legacy140399@cluster0.9qqagie.mongodb.net/";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret";
// const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH || "http://localhost:3000";

module.exports = {
  PORT,
  MONGODB_CONNECTION_STRING,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  // BACKEND_SERVER_PATH,
};
     