const fs = require("fs");
const dotenv = require("dotenv");

// dotenv.config()

// const isProtected = process.env.PROTECTED
const isProtected = false;

const sslConfig = {};

const getCredentials = () => {
  if (isProtected === true) {
    return {
      key: fs.readFileSync("/etc/letsencrypt/live/dev.legacyx.uk/privkey.pem"),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/dev.legacyx.uk/fullchain.pem"
      ),
    };
  }

  return null;
};

module.exports = {
  sslConfig,
  isProtected,
  credentials: getCredentials(),
};
