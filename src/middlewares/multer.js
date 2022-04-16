const fs = require("fs");
const multer = require("multer");

const MIME_TYPES = {
  //mimetype: 'image/png',
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    // permet de recuperer l'id de l'utilisateur , on genere le nom du fichier , et si ce fichier n'existe pas alors ==> creation.
    const userId = JSON.parse(req.body.sauce).userId;
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    const filename = name.replace(extension, "") + userId + "." + extension;
    if (!fs.existsSync("/images/", +filename)) callback(null, filename);
  },
});

module.exports = multer({ storage }).single("image");
