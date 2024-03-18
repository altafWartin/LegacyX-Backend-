const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/" + req.body.entityType);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const uploadImage = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("upload");
module.exports = {
  uploadImage,
};
