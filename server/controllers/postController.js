const { Storage } = require('../data/storage');

// Get all posts with flexible filtering
exports.getPosts = async (req, res) => {
  try {
    const { status, type, category, isFeatured, search, admin } = req.query;

    const filter = {};
    // If admin parameter with valid token, allow all or specific status
    if (admin === 'true' && req.user) {
      if (status && status !== 'all') {
        filter.status = status;
      }
      // If status is 'all' or undefined with admin=true, do not filter by status
    } else {
      filter.status = status && status === 'draft' && req.user ? 'draft' : 'published';
    }

    if (type && type !== 'all') filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (search) filter.search = search.trim();

    const posts = await Storage.getPosts(filter);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Get single post by slug or ID with adjacent (prev/next) and related posts
exports.getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Storage.getPostBySlugOrId(slug);

    if (!post) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Hide draft articles from non-logged in public users
    if (post.status === 'draft' && !req.user) {
      return res.status(404).json({ message: 'Article not found or has not been published yet.' });
    }

    // Increment view count for published articles
    if (post.status === 'published') {
      await Storage.incrementPostViews(slug);
    }

    // Find all published posts of same type for prev/next and related
    const allPublished = await Storage.getPosts({ status: 'published', type: post.type });
    const currentIndex = allPublished.findIndex(p => p._id.toString() === post._id.toString() || p.slug.toLowerCase() === post.slug.toLowerCase());

    let prevPost = null;
    let nextPost = null;

    if (currentIndex !== -1) {
      if (currentIndex > 0) {
        prevPost = {
          title: allPublished[currentIndex - 1].title,
          slug: allPublished[currentIndex - 1].slug,
          type: allPublished[currentIndex - 1].type
        };
      }
      if (currentIndex < allPublished.length - 1) {
        nextPost = {
          title: allPublished[currentIndex + 1].title,
          slug: allPublished[currentIndex + 1].slug,
          type: allPublished[currentIndex + 1].type
        };
      }
    }

    // Find related posts (same category or type, different id, max 3)
    const related = allPublished
      .filter(p => (p._id.toString() !== post._id.toString() && p.slug.toLowerCase() !== post.slug.toLowerCase()) && (p.category?.toLowerCase() === post.category?.toLowerCase() || p.type === post.type))
      .slice(0, 3);

    res.json({
      post,
      prevPost,
      nextPost,
      relatedPosts: related
    });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(500).json({ message: 'Failed to fetch article' });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { 
      title, slug, excerpt, content, coverImage, 
      category, type, tags, status, isFeatured, 
      publishedAt, authorName, authorAvatar 
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Auto generate clean excerpt if missing
    let finalExcerpt = excerpt ? excerpt.trim() : '';
    if (!finalExcerpt) {
      const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      finalExcerpt = cleanText.substring(0, 160) + (cleanText.length > 160 ? '...' : '');
    }

    const postData = {
      title: title.trim(),
      slug: slug ? slug.trim().toLowerCase() : undefined,
      excerpt: finalExcerpt,
      content,
      coverImage: coverImage ? coverImage.trim() : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      category: category ? category.trim() : 'Reflections',
      type: type || 'blog',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      status: status || 'published',
      isFeatured: Boolean(isFeatured),
      publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : (publishedAt ? new Date(publishedAt) : null),
      authorName: authorName ? authorName.trim() : undefined,
      authorAvatar: authorAvatar ? authorAvatar.trim() : undefined
    };

    const newPost = await Storage.createPost(postData);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post: ' + error.message });
  }
};

// Update an existing post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, slug, excerpt, content, coverImage, 
      category, type, tags, status, isFeatured, 
      publishedAt, authorName, authorAvatar 
    } = req.body;

    let finalExcerpt = excerpt;
    if (content && (!finalExcerpt || !finalExcerpt.trim())) {
      const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      finalExcerpt = cleanText.substring(0, 160) + (cleanText.length > 160 ? '...' : '');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
    if (finalExcerpt !== undefined) updateData.excerpt = finalExcerpt.trim();
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (type !== undefined) updateData.type = type;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published' && !publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    if (authorName !== undefined) updateData.authorName = authorName.trim();
    if (authorAvatar !== undefined) updateData.authorAvatar = authorAvatar.trim();

    const updated = await Storage.updatePost(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Failed to update post: ' + error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Storage.deletePost(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ success: true, message: 'Post successfully deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

// Toggle status between draft and published
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Storage.getPostBySlugOrId(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const updateData = {
      status: newStatus,
      publishedAt: newStatus === 'published' ? (post.publishedAt || new Date()) : post.publishedAt
    };

    const updated = await Storage.updatePost(id, updateData);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling post status:', error);
    res.status(500).json({ message: 'Failed to toggle status' });
  }
};

// Get Dashboard Statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Storage.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};
