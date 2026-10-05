const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { initialCategories, initialPosts, initialUser } = require('./seedData');

const DB_FILE = path.join(__dirname, 'db.json');

// Memory/File DB state for local mode
let localDb = {
  user: null,
  categories: [],
  posts: []
};

let isMongoConnected = false;

// Initialize & migrate file database
function initLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      localDb = JSON.parse(data);

      // Auto-migrate user record if missing new fields
      if (localDb.user) {
        localDb.user = {
          ...initialUser,
          ...localDb.user,
          fullBio: localDb.user.fullBio || initialUser.fullBio,
          favoriteBooks: localDb.user.favoriteBooks || initialUser.favoriteBooks,
          interests: localDb.user.interests || initialUser.interests,
          writingInterests: localDb.user.writingInterests || initialUser.writingInterests,
          socialLinks: {
            ...initialUser.socialLinks,
            ...(localDb.user.socialLinks || {})
          }
        };
      }

      // Auto-migrate posts if missing authorName / authorAvatar
      if (Array.isArray(localDb.posts)) {
        localDb.posts = localDb.posts.map(p => ({
          authorName: p.authorName || 'Ankur',
          authorAvatar: p.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          ...p
        }));
      }

      saveLocalDb();
    } else {
      localDb = {
        user: null,
        categories: initialCategories.map((c, i) => ({
          _id: `cat_${i + 1}`,
          ...c,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        posts: initialPosts.map((p, i) => ({
          _id: `post_${i + 1}`,
          ...p,
          createdAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      };
      saveLocalDb();
    }
  } catch (err) {
    console.error('Error initializing local DB:', err);
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local DB file:', err);
  }
}

// Check MongoDB connection status
function setMongoStatus(status) {
  isMongoConnected = status;
}

// Storage operations that dynamically dispatch to Mongoose or Local File DB
const Storage = {
  isMongo() {
    return isMongoConnected && mongoose.connection.readyState === 1;
  },

  // --- USER METHODS ---
  async getUser() {
    if (this.isMongo()) {
      const User = require('../models/User');
      return await User.findOne();
    }
    return localDb.user;
  },

  async getUserById(id) {
    if (this.isMongo()) {
      const User = require('../models/User');
      return await User.findById(id);
    }
    if (localDb.user && (localDb.user._id === id || localDb.user.id === id)) {
      return localDb.user;
    }
    return null;
  },

  async getUserByEmail(email) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    if (this.isMongo()) {
      const User = require('../models/User');
      return await User.findOne({ email: normalized });
    }
    if (localDb.user && localDb.user.email && localDb.user.email.toLowerCase() === normalized) {
      return localDb.user;
    }
    return null;
  },

  async getUserByResetToken(hashedToken) {
    if (!hashedToken) return null;
    if (this.isMongo()) {
      const User = require('../models/User');
      return await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() }
      });
    }
    if (
      localDb.user &&
      localDb.user.resetPasswordToken === hashedToken &&
      localDb.user.resetPasswordExpires &&
      new Date(localDb.user.resetPasswordExpires).getTime() > Date.now()
    ) {
      return localDb.user;
    }
    return null;
  },

  async createUser(userData) {
    if (this.isMongo()) {
      const User = require('../models/User');
      return await User.create(userData);
    }
    localDb.user = {
      _id: 'user_' + Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveLocalDb();
    return localDb.user;
  },

  async updateUser(updateData) {
    if (this.isMongo()) {
      const User = require('../models/User');
      let user = await User.findOne();
      if (!user) {
        user = await User.create(updateData);
      } else {
        Object.assign(user, updateData);
        if (updateData.socialLinks) {
          user.socialLinks = { ...user.socialLinks, ...updateData.socialLinks };
          user.markModified('socialLinks');
        }
        if (updateData.favoriteBooks) {
          user.markModified('favoriteBooks');
        }
        if (updateData.interests) {
          user.markModified('interests');
        }
        if (updateData.writingInterests) {
          user.markModified('writingInterests');
        }
        await user.save();
      }
      return user;
    }
    localDb.user = { 
      ...(localDb.user || {}), 
      ...updateData,
      socialLinks: {
        ...(localDb.user?.socialLinks || {}),
        ...(updateData.socialLinks || {})
      },
      updatedAt: new Date().toISOString()
    };
    saveLocalDb();
    return localDb.user;
  },

  // --- CATEGORY METHODS ---
  async getCategories() {
    if (this.isMongo()) {
      const Category = require('../models/Category');
      let categories = await Category.find().sort({ createdAt: -1 });
      if (categories.length === 0) {
        await Category.insertMany(initialCategories);
        categories = await Category.find().sort({ createdAt: -1 });
      }
      return categories;
    }
    return localDb.categories;
  },

  async createCategory(catData) {
    if (this.isMongo()) {
      const Category = require('../models/Category');
      return await Category.create(catData);
    }
    const newCat = {
      _id: `cat_${Date.now()}`,
      ...catData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localDb.categories.push(newCat);
    saveLocalDb();
    return newCat;
  },

  async deleteCategory(id) {
    if (this.isMongo()) {
      const Category = require('../models/Category');
      if (mongoose.Types.ObjectId.isValid(id)) {
        const byId = await Category.findByIdAndDelete(id);
        if (byId) return byId;
      }
      return await Category.findOneAndDelete({ slug: id.toLowerCase() });
    }
    const idx = localDb.categories.findIndex(c => c._id === id || c.slug.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      const deleted = localDb.categories.splice(idx, 1)[0];
      saveLocalDb();
      return deleted;
    }
    return null;
  },

  // --- POST METHODS ---
  async getPosts(filter = {}) {
    if (this.isMongo()) {
      const Post = require('../models/Post');
      const query = {};
      if (filter.status) query.status = filter.status;
      if (filter.type) query.type = filter.type;
      if (filter.category) {
        const escaped = filter.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.category = { $regex: new RegExp(`^${escaped}$`, 'i') };
      }
      if (filter.isFeatured !== undefined) query.isFeatured = filter.isFeatured;
      if (filter.search) {
        const searchRegex = { $regex: filter.search, $options: 'i' };
        query.$or = [
          { title: searchRegex },
          { excerpt: searchRegex },
          { tags: searchRegex },
          { authorName: searchRegex },
          { category: searchRegex }
        ];
      }
      return await Post.find(query).sort({ publishedAt: -1, createdAt: -1 });
    }

    let posts = [...localDb.posts];

    if (filter.status) {
      posts = posts.filter(p => p.status === filter.status);
    }
    if (filter.type) {
      posts = posts.filter(p => p.type === filter.type);
    }
    if (filter.category) {
      posts = posts.filter(p => p.category?.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.isFeatured !== undefined) {
      posts = posts.filter(p => Boolean(p.isFeatured) === Boolean(filter.isFeatured));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      posts = posts.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.authorName && p.authorName.toLowerCase().includes(q))
      );
    }

    posts.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
    return posts;
  },

  async getPostBySlugOrId(identifier) {
    if (!identifier) return null;

    if (this.isMongo()) {
      const Post = require('../models/Post');
      if (mongoose.Types.ObjectId.isValid(identifier)) {
        const byId = await Post.findById(identifier);
        if (byId) return byId;
      }
      return await Post.findOne({ slug: identifier.toLowerCase() });
    }

    const post = localDb.posts.find(p => p.slug?.toLowerCase() === identifier.toLowerCase() || p._id === identifier);
    return post || null;
  },

  async incrementPostViews(idOrSlug) {
    if (!idOrSlug) return null;

    if (this.isMongo()) {
      const Post = require('../models/Post');
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        return await Post.findByIdAndUpdate(idOrSlug, { $inc: { views: 1 } }, { new: true });
      }
      return await Post.findOneAndUpdate({ slug: idOrSlug.toLowerCase() }, { $inc: { views: 1 } }, { new: true });
    }

    const post = localDb.posts.find(p => p.slug?.toLowerCase() === idOrSlug.toLowerCase() || p._id === idOrSlug);
    if (post) {
      post.views = (post.views || 0) + 1;
      saveLocalDb();
      return post;
    }
    return null;
  },

  async createPost(postData) {
    // Generate clean slug if not provided
    if (!postData.slug && postData.title) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);
    } else if (postData.slug) {
      postData.slug = postData.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Calculate reading time roughly
    if (!postData.readingTime && postData.content) {
      const words = postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      postData.readingTime = `${minutes} min read`;
    }

    // Author defaults
    const authorUser = await this.getUser();
    if (!postData.authorName) {
      postData.authorName = authorUser?.name || 'Ankur';
    }
    if (!postData.authorAvatar) {
      postData.authorAvatar = authorUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    }

    if (this.isMongo()) {
      const Post = require('../models/Post');
      return await Post.create(postData);
    }

    const newPost = {
      _id: `post_${Date.now()}`,
      ...postData,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: postData.status === 'published' ? (postData.publishedAt || new Date().toISOString()) : (postData.publishedAt || null)
    };

    localDb.posts.unshift(newPost);
    saveLocalDb();
    return newPost;
  },

  async updatePost(idOrSlug, updateData) {
    if (updateData.slug) {
      updateData.slug = updateData.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    if (updateData.content && !updateData.readingTime) {
      const words = updateData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      updateData.readingTime = `${minutes} min read`;
    }

    if (this.isMongo()) {
      const Post = require('../models/Post');
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        const byId = await Post.findByIdAndUpdate(idOrSlug, updateData, { new: true });
        if (byId) return byId;
      }
      return await Post.findOneAndUpdate({ slug: idOrSlug.toLowerCase() }, updateData, { new: true });
    }

    const idx = localDb.posts.findIndex(p => p._id === idOrSlug || p.slug?.toLowerCase() === idOrSlug.toLowerCase());
    if (idx !== -1) {
      localDb.posts[idx] = {
        ...localDb.posts[idx],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveLocalDb();
      return localDb.posts[idx];
    }
    return null;
  },

  async deletePost(idOrSlug) {
    if (this.isMongo()) {
      const Post = require('../models/Post');
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        const byId = await Post.findByIdAndDelete(idOrSlug);
        if (byId) return byId;
      }
      return await Post.findOneAndDelete({ slug: idOrSlug.toLowerCase() });
    }

    const idx = localDb.posts.findIndex(p => p._id === idOrSlug || p.slug?.toLowerCase() === idOrSlug.toLowerCase());
    if (idx !== -1) {
      const deleted = localDb.posts.splice(idx, 1)[0];
      saveLocalDb();
      return deleted;
    }
    return null;
  },

  async getStats() {
    const allPosts = await this.getPosts({});
    const published = allPosts.filter(p => p.status === 'published');
    const drafts = allPosts.filter(p => p.status === 'draft');
    const blogs = allPosts.filter(p => p.type === 'blog');
    const stories = allPosts.filter(p => p.type === 'story');
    const totalViews = allPosts.reduce((acc, curr) => acc + (curr.views || 0), 0);

    return {
      totalPosts: allPosts.length,
      publishedPosts: published.length,
      draftPosts: drafts.length,
      blogCount: blogs.length,
      storyCount: stories.length,
      totalViews
    };
  }
};

// Initialize and migrate file database immediately
initLocalDb();

module.exports = {
  Storage,
  setMongoStatus
};
