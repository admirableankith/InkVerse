import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import ArticleCard from '../components/ArticleCard';
import ReadingProgressBar from '../components/ReadingProgressBar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { 
  ArrowLeft, Clock, Calendar, Share2, Check, 
  ChevronLeft, ChevronRight, BookOpen, Eye, 
  Edit, Trash2 
} from 'lucide-react';

export default function PostDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [postData, setPostData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Scroll to top on slug change
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchPostAndProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, profileData] = await Promise.all([
          api.getPostBySlug(slug),
          api.getProfile().catch(() => null)
        ]);
        setPostData(data);
        setProfile(profileData);
      } catch (err) {
        console.error('Error fetching post detail:', err);
        setError('Article not found or has not been published yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndProfile();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share && postData?.post) {
      try {
        await navigator.share({
          title: postData.post.title,
          text: postData.post.excerpt,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // User cancelled share sheet
        }
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        console.error('Clipboard copy failed:', e);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!postData?.post) return;
    setIsDeleting(true);
    try {
      await api.deletePost(postData.post._id || postData.post.slug);
      setDeleteModalOpen(false);
      navigate('/blogs');
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently published';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-6">
        <div className="h-4 w-24 bg-app-surface-hover rounded animate-pulse" />
        <div className="h-10 w-full bg-app-surface-hover rounded animate-pulse" />
        <div className="h-6 w-3/4 bg-app-surface-hover rounded animate-pulse" />
        <div className="aspect-[16/9] w-full bg-app-surface-hover rounded-xl animate-pulse mt-6" />
        <div className="space-y-4 pt-6">
          <div className="h-4 w-full bg-app-surface-hover rounded animate-pulse" />
          <div className="h-4 w-full bg-app-surface-hover rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-app-surface-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !postData?.post) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 sm:py-20 px-4 space-y-4">
        <BookOpen className="w-12 h-12 text-app-muted mx-auto" />
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-app-main">
          Article Not Found
        </h2>
        <p className="text-xs sm:text-sm text-app-muted">
          {error || "The article you are looking for doesn't exist or may have been drafted."}
        </p>
        <div className="pt-2">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-main text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Article</span>
          </Link>
        </div>
      </div>
    );
  }

  const { post, prevPost, nextPost, relatedPosts } = postData;
  const authorDisplayName = post.authorName || profile?.name || 'Ankur';
  const authorDisplayAvatar = post.authorAvatar || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  return (
    <div>
      {/* Top Reading Progress Bar */}
      <ReadingProgressBar />

      <article className="max-w-3xl mx-auto pb-12 sm:pb-16">
        
        {/* Navigation & Admin Action Bar */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            to={post.type === 'story' ? '/stories' : '/blogs'}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-app-muted hover:text-primary-main transition-colors min-h-[44px] py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {post.type === 'story' ? 'Publications' : 'Article'}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Admin Edit / Delete Controls */}
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 mr-1 bg-primary-light dark:bg-primary-light/30 px-2.5 py-1 rounded-lg border border-primary-main/30">
                <Link
                  to={`/admin/edit/${post._id || post.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-main hover:bg-primary-hover text-white text-xs font-semibold rounded-md transition-colors shadow-2xs min-h-[36px]"
                  title="Edit this article in Admin"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-app-surface hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600 text-xs font-semibold rounded-md border border-app-border transition-colors min-h-[36px]"
                  title="Delete this article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
              title="Share or Copy Link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-app-muted" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Header Information */}
        <header className="space-y-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <CategoryBadge category={post.category} className="text-xs py-1 px-3" />
            {post.status === 'draft' && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Draft (Unpublished)
              </span>
            )}
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-app-main tracking-tight leading-[1.2]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg md:text-xl text-app-muted font-sans leading-relaxed pt-1">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta bar */}
          <div className="pt-4 border-t border-app-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-app-muted">
            <div className="flex items-center gap-3">
              <img
                src={authorDisplayAvatar}
                alt={authorDisplayName}
                className="w-10 h-10 rounded-full aspect-square shrink-0 object-cover border border-app-border"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
                }}
              />
              <div>
                <span className="font-semibold text-app-main block text-sm">
                  {authorDisplayName}
                </span>
                <span className="text-app-muted text-[11px]">
                  {profile?.education || 'College Student & Writer'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-app-muted shrink-0" />
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-app-muted shrink-0" />
                <span>{post.readingTime || '4 min read'}</span>
              </div>
              {post.views > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-app-muted shrink-0" />
                    <span>{post.views} reads</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image with fixed aspect ratio */}
        {post.coverImage && (
          <div className="my-6 sm:my-8 rounded-xl sm:rounded-2xl overflow-hidden bg-app-surface border border-app-border shadow-sm aspect-[16/9] w-full">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        )}

        {/* Main Article Content (Prose, table scrolling, 16:9 videos) */}
        <div 
          className="article-prose mt-6 sm:mt-8 mb-10 sm:mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="py-4 sm:py-6 border-t border-b border-app-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-app-muted uppercase tracking-wider mr-1">
              Tags:
            </span>
            {post.tags.map((tag, i) => (
              <Link
                key={i}
                to={`/blogs?search=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-app-surface-hover hover:bg-primary-light hover:text-primary-main text-app-main text-xs font-medium border border-app-border transition-colors min-h-[36px]"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author Bio Box */}
        <div className="my-8 sm:my-10 p-5 sm:p-6 card-soft flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={authorDisplayAvatar}
            alt={authorDisplayName}
            className="w-16 h-16 rounded-full aspect-square shrink-0 object-cover border border-app-border"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
            }}
          />
          <div className="space-y-1.5 flex-1">
            <h4 className="font-serif font-bold text-base text-app-main">
              Written by {authorDisplayName}
            </h4>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed font-sans">
              {profile?.bio || 'Undergraduate student writing personal essays on student life, book discoveries, and thoughts on mindful living.'}
            </p>
            <Link
              to="/about"
              className="inline-block text-xs font-semibold text-primary-main hover:underline pt-1 min-h-[36px]"
            >
              Read more about {authorDisplayName} →
            </Link>
          </div>
        </div>

        {/* Previous & Next Navigation (Stacked on mobile, 2-col on sm+) */}
        <div className="my-8 sm:my-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              to={`/post/${prevPost.slug}`}
              className="p-4 sm:p-5 card-soft hover:border-primary-main transition-all flex flex-col justify-between group text-left min-h-[80px]"
            >
              <div className="flex items-center gap-1 text-xs text-app-muted group-hover:text-primary-main transition-colors mb-2">
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Previous Article</span>
              </div>
              <span className="font-serif font-medium text-sm text-app-main group-hover:text-primary-main transition-colors line-clamp-2">
                {prevPost.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextPost && (
            <Link
              to={`/post/${nextPost.slug}`}
              className="p-4 sm:p-5 card-soft hover:border-primary-main transition-all flex flex-col justify-between group text-left sm:text-right min-h-[80px]"
            >
              <div className="flex items-center sm:justify-end gap-1 text-xs text-app-muted group-hover:text-primary-main transition-colors mb-2">
                <span>Next Article</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </div>
              <span className="font-serif font-medium text-sm text-app-main group-hover:text-primary-main transition-colors line-clamp-2">
                {nextPost.title}
              </span>
            </Link>
          )}
        </div>

        {/* Related Posts (1-col mobile, 2-col tablet, 3-col desktop) */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-app-border">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-app-main mb-6">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <ArticleCard key={rPost._id || rPost.slug} post={rPost} />
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={post.title}
        loading={isDeleting}
      />
    </div>
  );
}
