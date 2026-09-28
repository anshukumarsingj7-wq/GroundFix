/**
 * GroundFix Multer Upload Middleware
 * Supports memory storage for direct buffer access and authenticity analysis
 */

const multer = require('multer');

// Store file in memory buffer so we can analyze bytes, EXIF, and upload to Supabase or local storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size
  }
});

module.exports = upload;
