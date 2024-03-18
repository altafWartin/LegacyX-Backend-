const express = require("express");
const auth = require("../middlewares/auth");
const authController = require("../controllers/authController");
const user = require("../middlewares/user");
const { uploadImage } = require("../middlewares/uploadImage");
const router = express.Router();

//test
router.get("/test", (req, res) => res.json({ msg: "Welcome to TEST page" }));

//register
router.post("/register", authController.register);

//verify-otp
router.post("/verify-otp", auth, authController.verifyOTP);

//change-password
router.post("/change-password", auth, authController.changePassword);

//regenerate-otp
router.get("/regenerate-otp", auth, authController.regenerateOtp);

//forget-password
router.post("/forget-password", authController.forgetPassword);

//login
router.post("/login", authController.login);

//login Admin
router.post("/loginAdmin", authController.loginAdmin);

//logout
router.post("/logout", auth, authController.logout);

// upload Image (profile,cover)
router.post("/upload-image", auth, uploadImage, authController.uploadImage);

// update profile
router.post("/update-profile", auth, authController.updateProfile);

// update password
router.post("/update-password", auth, authController.updatePassword);

router.get("/profile", auth, authController.getPorfile);

router.get("/allProfile", auth, authController.getallPorfile);

router.get("/delete-account", auth, authController.deleteAccount);

module.exports = router;