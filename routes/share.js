const express = require("express");
const router = express.Router();
const user = require("../middlewares/user");
const shareController = require("../controllers/shareController");

//like or unlike
router.post("/", user, shareController.share);

module.exports = router;
