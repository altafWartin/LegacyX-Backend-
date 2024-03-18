const dotenv = require("dotenv").config();

const PORT = process.env.PORT || 3000;
const MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING || "mongodb://localhost:27017/mydatabase";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default_access_token_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default_refresh_token_secret";
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH || "http://localhost:3000";

module.exports = {
  PORT,
  MONGODB_CONNECTION_STRING,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  BACKEND_SERVER_PATH,
};
     