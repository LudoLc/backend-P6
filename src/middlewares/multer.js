const multer = require('multer');

const MIME_TYPES = {
    //mimetype: 'image/png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    destination: (req, file , callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name.replace(extension, '') + Date.now() + '.' + extension)
        console.log("filename", name);
    }
});

module.exports = multer({ storage }).single('image');