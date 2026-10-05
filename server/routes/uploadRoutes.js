const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { authMiddleware } = require('../middleware/auth');

// Ensure local uploads directory exists for fallback
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage in memory to allow magic-byte verification and direct streaming to Cloudinary or disk
const storage = multer.memoryStorage();

// File filter: strict extension and MIME verification
const fileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|webp/;
  const allowedMime = /^image\/(jpeg|jpg|png|webp)$/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isValidExt = allowedExts.test(ext);
  const isValidMime = allowedMime.test(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed!'), false);
  }
};

// Size limit: Max 2 MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: fileFilter
});

/**
 * Verify image magic bytes from buffer
 */
function verifyMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG magic bytes: FF D8 FF
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  // WebP magic bytes: RIFF....WEBP
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';

  return isJpeg || isPng || (isRiff && isWebp);
}

/**
 * Helper to upload buffer to Cloudinary using stream
 */
function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'discoverwithankur',
        resource_type: 'image',
        public_id: path.parse(filename).name
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

router.post('/', authMiddleware, (req, res) => {
  upload.single('image')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds the 2 MB limit.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    // Deep inspection of genuine image magic bytes
    const isValidImage = verifyMagicBytes(req.file.buffer);
    if (!isValidImage) {
      return res.status(400).json({
        message: 'File validation failed: Content does not match a valid JPG, PNG, or WebP image signature.'
      });
    }

    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const filename = `img-${Date.now()}-${randomName}${safeExt}`;

    // Check if Cloudinary credentials are provided
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      try {
        const cloudResult = await uploadToCloudinary(req.file.buffer, filename);
        return res.json({
          success: true,
          imageUrl: cloudResult.secure_url,
          filename: filename,
          provider: 'cloudinary'
        });
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        return res.status(500).json({
          message: `Cloud storage upload failed: ${cloudErr.message || 'Check Cloudinary credentials.'}`
        });
      }
    }

    // Local disk fallback for development when Cloudinary is not configured
    try {
      const localFilePath = path.join(uploadsDir, filename);
      fs.writeFileSync(localFilePath, req.file.buffer);

      const imageUrl = `/uploads/${filename}`;
      return res.json({
        success: true,
        imageUrl: imageUrl,
        filename: filename,
        provider: 'local'
      });
    } catch (diskErr) {
      console.error('Local disk write error:', diskErr);
      return res.status(500).json({ message: 'Failed to save uploaded image to disk.' });
    }
  });
});

module.exports = router;
