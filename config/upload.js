const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Set up storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../storage/public/chat')); 
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const uniqueId = uuidv4();
        const filename = `Chat-app-${timestamp}-${uniqueId}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;
