const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Strict rate limiter for sensitive authentication actions (5 attempts per 15 mins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login or password reset attempts from this IP. Please try again after 15 minutes.'
  }
});

// Authentication endpoints
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getMe);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);

// Public & Admin Author Profile endpoints
router.get('/profile', authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Legacy backward-compatibility for /api/auth/me PUT if requested
router.put('/me', authMiddleware, authController.updateProfile);

module.exports = router;
