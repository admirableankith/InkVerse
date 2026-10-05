const path = require('path');
const fs = require('fs');
const dns = require('dns');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

async function migrate() {
  console.log('========================================================');
  console.log('🚀 Discover with Ankur - MongoDB Atlas Data Migration');
  console.log('========================================================\n');

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri || !mongoUri.trim()) {
    console.error('❌ Error: No MONGO_URI found in your .env file.');
    console.error('👉 Please set MONGO_URI in your .env file before running migration.\n');
    process.exit(1);
  }

  // Setup DNS resolvers for MongoDB SRV connection
  if (mongoUri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
    } catch (e) {
      // Ignore
    }
  }

  // Check db.json exists
  if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Error: Source file ${DB_FILE} not found.`);
    process.exit(1);
  }

  let dbData;
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbData = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Error parsing ${DB_FILE}:`, err.message);
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.host} / db: ${conn.connection.name}\n`);
  } catch (err) {
    console.error(`❌ Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const summary = {
    usersMigrated: 0,
    usersSkipped: 0,
    categoriesMigrated: 0,
    categoriesSkipped: 0,
    postsMigrated: 0,
    postsSkipped: 0
  };

  // 1. Migrate Admin User
  if (dbData.user && dbData.user.email) {
    const existingUser = await User.findOne({
      $or: [
        { email: dbData.user.email.toLowerCase() },
        {} // check if any admin exists
      ]
    });

    if (existingUser) {
      console.log(`ℹ️  Admin User: Skipped (An administrator account '${existingUser.email}' already exists in MongoDB).`);
      summary.usersSkipped++;
    } else {
      const passwordHash = dbData.user.password || dbData.user.passwordHash;
      if (!passwordHash) {
        console.warn('⚠️  Warning: No password found for local user in db.json. Skipping user migration.');
        summary.usersSkipped++;
      } else {
        await User.create({
          name: dbData.user.name || 'Ankur',
          email: dbData.user.email.toLowerCase().trim(),
          password: passwordHash, // Preserving existing bcrypt hash directly without rehashing
          bio: dbData.user.bio || '',
          fullBio: dbData.user.fullBio || '',
          avatar: dbData.user.avatar || '',
          education: dbData.user.education || '',
          interests: dbData.user.interests || [],
          writingInterests: dbData.user.writingInterests || [],
          favoriteBooks: dbData.user.favoriteBooks || [],
          socialLinks: dbData.user.socialLinks || {},
          tokenVersion: dbData.user.tokenVersion || 0,
          resetPasswordToken: dbData.user.resetPasswordToken || null,
          resetPasswordExpires: dbData.user.resetPasswordExpires ? new Date(dbData.user.resetPasswordExpires) : null,
          passwordChangedAt: dbData.user.passwordChangedAt ? new Date(dbData.user.passwordChangedAt) : null,
          createdAt: dbData.user.createdAt ? new Date(dbData.user.createdAt) : new Date(),
          updatedAt: dbData.user.updatedAt ? new Date(dbData.user.updatedAt) : new Date()
        });
        console.log(`✅ Admin User: Successfully migrated '${dbData.user.email}'.`);
        summary.usersMigrated++;
      }
    }
  } else {
    console.log('ℹ️  Admin User: No user defined in db.json.');
  }

  // 2. Migrate Categories
  if (Array.isArray(dbData.categories) && dbData.categories.length > 0) {
    for (const cat of dbData.categories) {
      if (!cat.name || !cat.slug) continue;

      const cleanSlug = cat.slug.toLowerCase().trim();
      const existingCat = await Category.findOne({
        $or: [{ slug: cleanSlug }, { name: cat.name.trim() }]
      });

      if (existingCat) {
        summary.categoriesSkipped++;
      } else {
        await Category.create({
          name: cat.name.trim(),
          slug: cleanSlug,
          description: cat.description || '',
          type: cat.type || 'both',
          createdAt: cat.createdAt ? new Date(cat.createdAt) : new Date(),
          updatedAt: cat.updatedAt ? new Date(cat.updatedAt) : new Date()
        });
        console.log(`✅ Category: Migrated '${cat.name}' (${cleanSlug})`);
        summary.categoriesMigrated++;
      }
    }
  }

  // 3. Migrate Posts
  if (Array.isArray(dbData.posts) && dbData.posts.length > 0) {
    for (const post of dbData.posts) {
      if (!post.title || !post.slug) continue;

      const cleanSlug = post.slug.toLowerCase().trim();
      const existingPost = await Post.findOne({ slug: cleanSlug });

      if (existingPost) {
        summary.postsSkipped++;
      } else {
        await Post.create({
          title: post.title.trim(),
          slug: cleanSlug,
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || 'Reflections',
          type: post.type || 'blog',
          tags: Array.isArray(post.tags) ? post.tags : [],
          authorName: post.authorName || 'Ankur',
          authorAvatar: post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          status: post.status || 'published',
          isFeatured: Boolean(post.isFeatured),
          readingTime: post.readingTime || '4 min read',
          views: typeof post.views === 'number' ? post.views : 0,
          coverImage: post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : (post.status === 'published' ? new Date() : null),
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date()
        });
        console.log(`✅ Post: Migrated '${post.title.substring(0, 45)}...' [${post.status}]`);
        summary.postsMigrated++;
      }
    }
  }

  console.log('\n========================================================');
  console.log('🎉 Migration Completed Successfully!');
  console.log('========================================================');
  console.log(`👤 Users:      ${summary.usersMigrated} migrated, ${summary.usersSkipped} skipped`);
  console.log(`📁 Categories: ${summary.categoriesMigrated} migrated, ${summary.categoriesSkipped} skipped`);
  console.log(`📝 Posts:       ${summary.postsMigrated} migrated, ${summary.postsSkipped} skipped`);
  console.log('========================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration script failed:', err);
  process.exit(1);
});
