const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp'); // Make directories recursively

// Define the uploads directory
const uploadDir = path.join(__dirname, '../../public/uploads');

// Create the uploads directory if it does not exist
mkdirp.sync(uploadDir);

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // File name format
  }
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 256 * 1024 * 1024 }, // Limit file size to 256MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|avi/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type.'));
  }
});

module.exports = upload;
