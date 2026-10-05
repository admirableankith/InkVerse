import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { 
  FileText, CheckCircle2, Clock, 
  Trash2, Edit, Eye, Plus, ExternalLink, 
  Search, RefreshCw, BookOpen, User, KeyRound 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Password and Delete modal state
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [allPosts, statsData, authorData] = await Promise.all([
        api.getPosts({ admin: 'true', status: 'all' }),
        api.getStats(),
        api.getProfile().catch(() => null)
      ]);
      setPosts(allPosts);
      setStats(statsData);
      setProfile(authorData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleStatus = async (post) => {
    try {
      await api.togglePostStatus(post._id || post.slug);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to toggle status: ' + error.message);
    }
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.deletePost(postToDelete._id || postToDelete.slug);
      setDeleteModalOpen(false);
      setPostToDelete(null);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete post: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts based on tab and search
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'published' && post.status !== 'published') return false;
    if (activeTab === 'draft' && post.status !== 'draft') return false;
    if (activeTab === 'blog' && post.type !== 'blog') return false;
    if (activeTab === 'story' && post.type !== 'story') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title?.toLowerCase().includes(q);
      const matchCat = post.category?.toLowerCase().includes(q);
      const matchAuthor = post.authorName?.toLowerCase().includes(q);
      return matchTitle || matchCat || matchAuthor;
    }

    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unscheduled';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 sm:pb-16">
      
      {/* Top Welcome & Quick Actions (Responsive wrap) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-app-border pb-5 sm:pb-6">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
            Writer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-app-muted font-sans mt-0.5">
            Welcome back, <span className="font-semibold text-app-main">{profile?.name || user?.name || 'Ankur'}</span>. Manage your articles, stories, drafts, and author profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => setChangePasswordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
            title="Change administrator password"
          >
            <KeyRound className="w-4 h-4 text-primary-main" />
            <span>Password</span>
          </button>

          <Link
            to="/admin/author"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
          >
            <User className="w-4 h-4 text-primary-main" />
            <span>Author Profile</span>
          </Link>

          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-muted hover:text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/admin/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-medium transition-colors shadow-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Post</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards (2-col mobile, 4-col desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="card-soft p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Total Posts</span>
            <FileText className="w-4 h-4 text-primary-main" />
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
            {stats.totalPosts}
          </div>
          <span className="text-[11px] text-app-muted block">All writings</span>
        </div>

        <div className="card-soft p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400">
            {stats.publishedPosts}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">Live on site</span>
        </div>

        <div className="card-soft p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-amber-700 dark:text-amber-400">
            {stats.draftPosts}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block">In progress</span>
        </div>

        <div className="card-soft p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-app-muted">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Total Reads</span>
            <Eye className="w-4 h-4 text-accent-main" />
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
            {stats.totalViews}
          </div>
          <span className="text-[11px] text-app-muted block">Article views</span>
        </div>

      </div>

      {/* Author Profile Quick Preview Card */}
      {profile && (
        <div className="card-soft p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-app-surface-hover/40">
          <div className="flex items-center gap-3.5">
            <img
              src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={profile.name}
              className="w-12 h-12 rounded-full aspect-square shrink-0 object-cover border-2 border-app-border shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-app-main">{profile.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-light text-primary-main font-medium">Author Record</span>
              </div>
              <p className="text-xs text-app-muted line-clamp-1 mt-0.5">{profile.bio}</p>
            </div>
          </div>

          <Link
            to="/admin/author"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap min-h-[44px] w-full sm:w-auto"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Author Details</span>
          </Link>
        </div>
      )}

      {/* Posts Management Section */}
      <div className="card-soft overflow-hidden">
        
        {/* Controls Bar: Tabs & Search */}
        <div className="p-4 sm:p-5 border-b border-app-border flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Writings' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Drafts' },
              { id: 'blog', label: 'Blogs' },
              { id: 'story', label: 'Stories' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-primary-main text-white font-semibold shadow-2xs'
                    : 'text-app-muted hover:bg-app-surface-hover hover:text-app-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search in Admin */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search writings..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[40px]"
            />
            <Search className="w-4 h-4 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* Posts Table (Safe responsive horizontal scroll) */}
        {loading ? (
          <div className="p-12 text-center text-app-muted text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-main" />
            <span>Loading your writings...</span>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-xs text-app-main min-w-[640px]">
              <thead className="bg-app-surface-hover/70 text-app-muted uppercase tracking-wider text-[10px] font-semibold border-b border-app-border">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Article Title</th>
                  <th className="py-3.5 px-3">Author</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Reads</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredPosts.map((post) => (
                  <tr key={post._id || post.slug} className="hover:bg-app-surface-hover/50 transition-colors">
                    
                    {/* Title & Excerpt */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-xs sm:max-w-sm">
                      <div className="font-serif font-bold text-sm text-app-main line-clamp-1 hover:text-primary-main transition-colors">
                        <Link to={`/admin/edit/${post._id || post.slug}`} className="inline-block py-1">
                          {post.title}
                        </Link>
                      </div>
                      <p className="text-[11px] text-app-muted line-clamp-1 font-sans">
                        {post.excerpt}
                      </p>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&q=80'}
                          alt={post.authorName || 'Author'}
                          className="w-5 h-5 rounded-full aspect-square shrink-0 object-cover border border-app-border"
                        />
                        <span className="text-xs font-medium text-app-main">{post.authorName || 'Ankur'}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <CategoryBadge category={post.category} />
                    </td>

                    {/* Type badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="capitalize text-app-muted font-medium">
                        {post.type === 'story' ? '📖 Story' : '✍️ Blog'}
                      </span>
                    </td>

                    {/* Status Toggle (Min 36px touch height) */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        title="Click to toggle between Published and Draft"
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-transform active:scale-95 border min-h-[36px] ${
                          post.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="capitalize">{post.status}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-app-muted font-sans text-[11px]">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>

                    {/* Reads */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-medium text-app-main">
                      {post.views || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        
                        {post.status === 'published' && (
                          <Link
                            to={`/post/${post.slug}`}
                            target="_blank"
                            title="View live post"
                            className="touch-target p-2 text-app-muted hover:text-app-main hover:bg-app-surface-hover rounded-md transition-colors"
                            aria-label="View live post"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}

                        <Link
                          to={`/admin/edit/${post._id || post.slug}`}
                          title="Edit article"
                          className="touch-target p-2 text-primary-main hover:bg-primary-light rounded-md transition-colors"
                          aria-label="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => openDeleteModal(post)}
                          title="Delete article"
                          className="touch-target p-2 text-app-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                          aria-label="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 sm:p-12 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-app-muted mx-auto" />
            <h3 className="font-serif font-bold text-base text-app-main">
              No writings found in this section
            </h3>
            <p className="text-xs text-app-muted max-w-sm mx-auto">
              Ready to start your next essay or personal story?
            </p>
            <div className="pt-2">
              <Link
                to="/admin/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-main hover:bg-primary-hover text-white rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Write a Post Now</span>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={postToDelete?.title}
        loading={isDeleting}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />

    </div>
  );
}
