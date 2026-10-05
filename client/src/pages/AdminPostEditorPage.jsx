import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import { 
  ArrowLeft, Save, Send, Upload, 
  Image as ImageIcon, Check, AlertCircle, 
  RefreshCw, User, Layers 
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Campus & Books', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Writing & Desk', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mountain Journey', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Student Library', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Morning Coffee', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Paper & Thoughts', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80' },
];

export default function AdminPostEditorPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [category, setCategory] = useState('Reflections');
  const [type, setType] = useState('blog');
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('published');
  const [publishedAt, setPublishedAt] = useState('');

  // Per-post author customization
  const [authorName, setAuthorName] = useState('Ankur');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');

  const [categories, setCategories] = useState([]);
  const [newCatInput, setNewCatInput] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAuthorPic, setUploadingAuthorPic] = useState(false);

  // Load initial post & categories
  useEffect(() => {
    const init = async () => {
      try {
        const [cats, profile] = await Promise.all([
          api.getCategories(),
          api.getProfile().catch(() => null)
        ]);
        setCategories(cats);

        if (!isEditMode && profile) {
          setAuthorName(profile.name || 'Ankur');
          setAuthorAvatar(profile.avatar || '');
          setPublishedAt(new Date().toISOString().substring(0, 10));
        }

        if (isEditMode) {
          const data = await api.getPostBySlug(id);
          if (data && data.post) {
            const p = data.post;
            setTitle(p.title || '');
            setSlug(p.slug || '');
            setExcerpt(p.excerpt || '');
            setContent(p.content || '');
            setCoverImage(p.coverImage || '');
            setCategory(p.category || (cats[0]?.name || 'Reflections'));
            setType(p.type || 'blog');
            setTags(p.tags ? p.tags.join(', ') : '');
            setIsFeatured(Boolean(p.isFeatured));
            setStatus(p.status || 'published');
            setAuthorName(p.authorName || profile?.name || 'Ankur');
            setAuthorAvatar(p.authorAvatar || profile?.avatar || '');
            if (p.publishedAt) {
              setPublishedAt(new Date(p.publishedAt).toISOString().substring(0, 10));
            } else {
              setPublishedAt(new Date().toISOString().substring(0, 10));
            }
          }
        }
      } catch (err) {
        console.error('Error initializing editor:', err);
        setError('Failed to load article data for editing.');
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  // Handle Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Cover image file must be less than 2 MB.');
      return;
    }

    setUploadingCover(true);
    setError('');
    try {
      const res = await api.uploadImage(file);
      if (res.imageUrl) {
        setCoverImage(res.imageUrl);
      }
    } catch (err) {
      console.error('Cover upload failed:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle Author Pic Upload for this post
  const handleAuthorPicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Author picture must be less than 2 MB.');
      return;
    }

    setUploadingAuthorPic(true);
    setError('');
    try {
      const res = await api.uploadImage(file);
      if (res.imageUrl) {
        setAuthorAvatar(res.imageUrl);
      }
    } catch (err) {
      console.error('Author pic upload failed:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setAuthorAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAuthorPic(false);
    }
  };

  // Add new Category on the fly
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;

    try {
      const newCat = await api.createCategory({ name: newCatInput.trim() });
      setCategories([...categories, newCat]);
      setCategory(newCat.name);
      setNewCatInput('');
      setShowAddCat(false);
    } catch (err) {
      alert('Could not add category: ' + err.message);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEditMode && !slug) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  // Save / Publish post
  const handleSave = async (intendedStatus) => {
    if (!title.trim()) {
      setError('Please enter a title for your post.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!content.trim()) {
      setError('Please write some content before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const postPayload = {
      title: title.trim(),
      slug: slug ? slug.trim().toLowerCase() : undefined,
      excerpt: excerpt.trim(),
      content: content,
      coverImage: coverImage.trim(),
      category: category,
      type: type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: intendedStatus || status,
      isFeatured: isFeatured,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      authorName: authorName.trim(),
      authorAvatar: authorAvatar.trim()
    };

    try {
      if (isEditMode) {
        await api.updatePost(id, postPayload);
        setSuccess('Article updated successfully!');
      } else {
        await api.createPost(postPayload);
        setSuccess('New article created successfully!');
      }
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save post.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-main" />
        <p className="text-sm text-app-muted">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      
      {/* Top Header & Save Actions Bar (Responsive wrap) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="touch-target rounded-lg text-app-muted hover:text-app-main hover:bg-app-surface-hover transition-colors"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-app-main">
              {isEditMode ? 'Edit Article' : 'Write New Article'}
            </h1>
            <p className="text-xs text-app-muted font-sans mt-0.5">
              Full control over content, metadata, cover image, and author details.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs disabled:opacity-50 min-h-[44px] flex-1 sm:flex-initial"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 min-h-[44px] flex-1 sm:flex-initial"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-800 dark:text-red-300 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Post Form */}
      <div className="space-y-6">
        
        {/* Title & Slug Inputs */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
              Article Title <span className="text-primary-main">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Lessons I Learned During College: Beyond Textbooks and Grades"
              className="w-full px-4 py-3 bg-app-surface border border-app-border rounded-xl text-base sm:text-lg lg:text-xl font-serif font-bold text-app-main placeholder-app-muted focus:outline-none focus:border-primary-main focus-accessible shadow-2xs min-h-[48px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                URL Slug <span className="text-app-muted font-normal">(e.g. /post/my-article-title)</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                placeholder="my-article-title"
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-xs font-mono text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                Publish Date
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-xs sm:text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>
          </div>

          {/* Short Excerpt */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
              Short Description / Excerpt (Shown on cards and article header)
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief 1-2 sentence overview of this piece..."
              className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-xl text-sm text-app-main placeholder-app-muted focus:outline-none focus:border-primary-main focus-accessible resize-none"
            />
          </div>
        </div>

        {/* Post Metadata: Category, Type, Tags, Status, Featured */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-main" />
            <h2 className="font-serif font-bold text-base text-app-main">
              Categorization & Publishing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Category */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-app-main">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCat(!showAddCat)}
                  className="text-[11px] text-primary-main hover:underline font-medium py-0.5"
                >
                  + Add New
                </button>
              </div>

              {showAddCat ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="New..."
                    className="w-full px-2 py-2 text-xs bg-app-surface border border-app-border rounded-lg min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-primary-main text-white rounded-lg text-xs font-semibold min-h-[44px]"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main min-h-[44px]"
                >
                  {categories.map((c) => (
                    <option key={c._id || c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Section Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main">
                Section Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main min-h-[44px]"
              >
                <option value="blog">✍️ Blog / Essay</option>
                <option value="story">📖 Personal Story</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main min-h-[44px]"
              >
                <option value="published">🟢 Published</option>
                <option value="draft">🟡 Draft (Hidden)</option>
              </select>
            </div>

            {/* Featured */}
            <div className="flex flex-col justify-center space-y-1.5">
              <label className="block text-xs font-semibold text-app-main">
                Featured Piece
              </label>
              <label className="flex items-center gap-2 cursor-pointer pt-1 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-primary-main focus:ring-primary-main w-5 h-5"
                />
                <span className="text-xs text-app-main select-none font-medium">
                  Pin to Homepage Hero
                </span>
              </label>
            </div>

          </div>

          {/* Tags */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. College, Habits, Books, Mindset"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
            />
          </div>
        </div>

        {/* Per-Post Author Customization Card */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary-main" />
            <h2 className="font-serif font-bold text-base text-app-main">
              Author Customization for this Post
            </h2>
          </div>

          <p className="text-xs text-app-muted">
            Customize the author name and author profile picture displayed on this specific article (or keep default).
          </p>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 pt-2">
            {/* Author Avatar Preview */}
            <div className="w-20 h-20 rounded-full aspect-square overflow-hidden border-2 border-app-border bg-app-surface-hover shrink-0 shadow-sm relative">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-app-muted">
                  <User className="w-6 h-6 opacity-40" />
                </div>
              )}
            </div>

            {/* Author Name and Avatar Controls */}
            <div className="space-y-3 flex-1 w-full">
              <div>
                <label className="block text-xs font-medium text-app-main mb-1">
                  Author Name Shown on Post
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ankur"
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]">
                  <Upload className="w-4 h-4 text-primary-main" />
                  <span>{uploadingAuthorPic ? 'Uploading...' : 'Upload Author Pic'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAuthorPicUpload}
                    disabled={uploadingAuthorPic}
                    className="hidden"
                  />
                </label>

                {authorAvatar && (
                  <button
                    type="button"
                    onClick={() => setAuthorAvatar('')}
                    className="px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-app-border transition-colors min-h-[44px]"
                  >
                    Remove Pic
                  </button>
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={authorAvatar}
                  onChange={(e) => setAuthorAvatar(e.target.value)}
                  placeholder="Or paste author photo URL..."
                  className="w-full px-3 py-2 text-xs bg-app-surface border border-app-border rounded-lg text-app-main font-mono focus:outline-none focus:border-primary-main focus-accessible min-h-[40px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image Picker with Live Preview & Replace/Remove */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary-main" />
              <h2 className="font-serif font-bold text-base text-app-main">
                Article Cover Image
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs sm:text-sm text-primary-main hover:underline font-medium min-h-[44px] py-1">
                <Upload className="w-4 h-4" />
                <span>{uploadingCover ? 'Uploading...' : 'Upload Cover File'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>

              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="text-xs sm:text-sm text-red-600 hover:underline min-h-[44px] py-1"
                >
                  Remove Cover
                </button>
              )}
            </div>
          </div>

          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Paste cover image URL here..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main font-mono focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
          />

          {/* Photography Preset Samples */}
          <div>
            <span className="text-[11px] text-app-muted font-sans block mb-2">
              Or pick from student-themed photography presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {COVER_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all group min-h-[60px] ${
                    coverImage === preset.url ? 'border-primary-main ring-2 ring-primary-main/30' : 'border-app-border hover:border-app-muted'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/65 py-1 px-1 text-[9px] text-white truncate text-center font-medium">
                    {preset.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Cover Preview */}
          {coverImage && (
            <div className="mt-3 aspect-[21/9] max-h-52 rounded-xl overflow-hidden border border-app-border bg-app-surface-hover shadow-sm w-full">
              <img
                src={coverImage}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="card-soft p-4 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
              Article Content <span className="text-primary-main">*</span>
            </label>
            <span className="text-[11px] text-app-muted font-sans">
              Visual WYSIWYG & Rich Text Editor
            </span>
          </div>
          
          <RichTextEditor
            value={content}
            onChange={(html) => setContent(html)}
            placeholder="Type your essay or personal story here..."
          />
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-6 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            to="/admin/dashboard"
            className="text-xs sm:text-sm text-app-muted hover:text-app-main transition-colors min-h-[44px] flex items-center"
          >
            ← Cancel and return to dashboard
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs disabled:opacity-50 min-h-[44px]"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave('published')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Saving...' : 'Publish Article'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
