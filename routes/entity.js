/** @format */

const express = require("express");
const router = express.Router();
const user = require("../middlewares/user");
const entityController = require("../controllers/entityController");
const multer = require("multer");
const upload = require("../middlewares/upload");

//upload gifs,images,videos
router.post("/upload", user, upload, entityController.upload);

router.get("/media/:categoryId", user, entityController.getMediaByCategory);

router.get("/feed", user, entityController.getAllFeed);

// get all by user
router.get("/user/:userId",  entityController.getAllByUser);

// create new category
router.post("/create-category", entityController.createCategory);

// get all category or by id
router.get("/category", user, entityController.getAllCategory);

// delete all media and category
router.get("/delete-mc", entityController.deleteAllMediaAndCategory);

// delete media by id
router.get("/delete/:mediaId", entityController.deleteMediaById);

//edit
router.get("/:entityType", user, entityController.getAll);

//get single by Id
router.get("/single/:id", user, entityController.getSingleById);

module.exports = router;
