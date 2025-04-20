// middleware/upload.js
const multer = require('multer');
const path = require('path');
const os = require('os');

// הגדרה זמנית – קבצים יישמרו בתיקייה זמנית במערכת
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir()); // למשל: /tmp ב-Linux
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // לדוג' 1706790087123-123123.zip
  }
});

const upload = multer({ storage });

module.exports = upload;
