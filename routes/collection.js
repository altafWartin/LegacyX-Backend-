const express = require("express");
const router = express.Router();
const user = require("../middlewares/user");
const collectionController = require("../controllers/collectionController");

//like or unlike
router.post("/create", user, collectionController.create);

//like or unlike
router.get("/all/:id", user, collectionController.getAll);

//like or unlike
router.get("/single/:id", user, collectionController.getSingleById);

module.exports = router;
