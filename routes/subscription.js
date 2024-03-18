/** @format */

const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const auth = require("../middlewares/auth");

router.post("/create", subscriptionController.create);
router.get("/get", subscriptionController.getAll);
router.post("/subscribe/:id", auth, subscriptionController.subscribe);
router.post("/cancel", auth, subscriptionController.cancelSubscription);
router.get("/logs", auth, subscriptionController.getSubscriptionsLogs);

module.exports = router;
