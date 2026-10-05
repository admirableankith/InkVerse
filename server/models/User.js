const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Ankur'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: 'College student & passionate writer exploring life, learning, books, and thoughts.'
  },
  fullBio: {
    type: String,
    default: `<p>When I started college, I felt overwhelmed by how quickly days seemed to evaporate between assignment deadlines, lecture halls, and social commitments. I realized that unless I deliberately paused to capture my thoughts, whole semesters would pass without me truly processing what I was learning.</p><p>This website is my personal notebook in public. It isn't intended to be a corporate portfolio or a hyper-optimized publishing empire. It's simply a calm, quiet haven where I can share essays about books, small travel journeys, campus stories, and reflections on navigating early adulthood.</p><blockquote>"We do not write in order to be understood; we write in order to understand what we are actually experiencing."</blockquote>`
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  education: {
    type: String,
    default: 'Third-Year Undergraduate Student'
  },
  interests: [{
    type: String,
    trim: true
  }],
  writingInterests: [{
    type: String,
    trim: true
  }],
  favoriteBooks: [{
    title: { type: String, required: true },
    author: { type: String, required: true },
    note: { type: String, default: '' }
  }],
  socialLinks: {
    twitter: { type: String, default: 'https://twitter.com' },
    github: { type: String, default: 'https://github.com' },
    linkedin: { type: String, default: 'https://linkedin.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    emailContact: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
