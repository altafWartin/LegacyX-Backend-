const express = require("express");
const router = express.Router();
const user = require("../middlewares/user");
const likeController = require("../controllers/likeController");

//like or unlike
router.post("/", user, likeController.like);

router.get("/notifications", user, likeController.likeNotification);

module.exports = router;
