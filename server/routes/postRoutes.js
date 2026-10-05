const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Public route to fetch posts (with optional auth to allow admin dashboard to query drafts)
router.get('/', optionalAuth, postController.getPosts);

// Admin stats route (must come before /:slug)
router.get('/stats', authMiddleware, postController.getStats);

// Single post route (with optional auth so admin can preview draft articles)
router.get('/:slug', optionalAuth, postController.getPostBySlug);

// Admin CRUD routes
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.patch('/:id/toggle-status', authMiddleware, postController.toggleStatus);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
