const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
  },
  category: {
    type: String,
    required: true,
    default: 'Reflections',
    trim: true
  },
  type: {
    type: String,
    enum: ['blog', 'story'],
    default: 'blog'
  },
  tags: [{
    type: String,
    trim: true
  }],
  authorName: {
    type: String,
    default: 'Ankur',
    trim: true
  },
  authorAvatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  readingTime: {
    type: String,
    default: '4 min read'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound and query optimization indexes
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ type: 1, status: 1 });
postSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);
