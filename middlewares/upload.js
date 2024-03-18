const multer = require("multer");
const path = require("path");
const fs = require("fs");
const folderName = "uploads";

function fileFiter(file) {
  if (file.mimetype === "image/gif") {
    return "gifs";
  } else if (
    file.mimetype.startsWith("video/") ||
    file.mimetype === "video/quicktime"
  ) {
    return "videos";
  } else if (file.mimetype.startsWith("image/")) {
    return "images";
  } else {
    return "default";
  }
}

function getFilename(req, file, cb) {
  const entityType = fileFiter(file);
  req.entityType = entityType;
  const fileExtension = file.mimetype.split("/")[1];
  const fileName = `${entityType}-${Date.now()}.${
    fileExtension == "quicktime" ? "mov" : fileExtension
  }`;
  req.fileName = fileName;
  cb(null, fileName);
}

function getDestination(req, file, cb, directory) {
  const entityType = fileFiter(file);
  const destination = `${directory}/${entityType}`;
  req.uploadUrl = destination;
  fs.mkdirSync(destination, { recursive: true });
  cb(null, `./${directory}/${entityType}`);
}

function getUploadsDestination(req, file, cb) {
  getDestination(req, file, cb, folderName);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    getUploadsDestination(req, file, cb);
  },
  filename: getFilename,
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000000 },
}).single("upload");

module.exports = upload;
