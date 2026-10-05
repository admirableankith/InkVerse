import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { 
  ArrowLeft, Save, Upload, Trash2, Plus, 
  Check, AlertCircle, RefreshCw, User, BookOpen, 
  Link as LinkIcon, KeyRound 
} from 'lucide-react';

export default function AdminAuthorEditorPage() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [fullBio, setFullBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState('');
  const [writingInterests, setWritingInterests] = useState('');
  
  // Bookshelf list: [{ title, author, note }]
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  
  // Social links
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    github: '',
    linkedin: '',
    instagram: '',
    emailContact: '',
    website: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadAuthorProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getProfile();
        setName(data.name || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        setFullBio(data.fullBio || '');
        setAvatar(data.avatar || '');
        setEducation(data.education || '');
        setInterests(Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''));
        setWritingInterests(Array.isArray(data.writingInterests) ? data.writingInterests.join(', ') : (data.writingInterests || ''));
        setFavoriteBooks(Array.isArray(data.favoriteBooks) && data.favoriteBooks.length > 0 ? data.favoriteBooks : [
          { title: 'The Anthropocene Reviewed', author: 'John Green', note: 'A beautiful masterclass in noticing small wonders in everyday life.' },
          { title: 'Atomic Habits', author: 'James Clear', note: 'Changed how I design my morning routine during heavy semester exam weeks.' }
        ]);
        setSocialLinks({
          twitter: data.socialLinks?.twitter || '',
          github: data.socialLinks?.github || '',
          linkedin: data.socialLinks?.linkedin || '',
          instagram: data.socialLinks?.instagram || '',
          emailContact: data.socialLinks?.emailContact || '',
          website: data.socialLinks?.website || ''
        });
      } catch (err) {
        console.error('Error loading author profile:', err);
        setErrorMessage('Failed to load author profile data.');
      } finally {
        setLoading(false);
      }
    };

    loadAuthorProfile();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image file must be less than 2 MB.');
      return;
    }

    setUploadingAvatar(true);
    setErrorMessage('');
    try {
      const res = await api.uploadImage(file);
      if (res.imageUrl) {
        setAvatar(res.imageUrl);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  const handleAddBook = () => {
    setFavoriteBooks([...favoriteBooks, { title: '', author: '', note: '' }]);
  };

  const handleBookChange = (index, field, value) => {
    const updated = [...favoriteBooks];
    updated[index][field] = value;
    setFavoriteBooks(updated);
  };

  const handleRemoveBook = (index) => {
    setFavoriteBooks(favoriteBooks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Author name is required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const payload = {
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      fullBio: fullBio,
      avatar: avatar.trim(),
      education: education.trim(),
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      writingInterests: writingInterests.split(',').map(s => s.trim()).filter(Boolean),
      favoriteBooks: favoriteBooks.filter(b => b.title.trim() && b.author.trim()),
      socialLinks: socialLinks
    };

    try {
      await updateProfile(payload);
      setSuccessMessage('Author profile updated successfully! All public sections now display the latest information.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to update author profile:', err);
      setErrorMessage(err.message || 'Failed to update author profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-main" />
        <p className="text-sm text-app-muted">Loading author details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20">
      
      {/* Top Header */}
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
              Edit About the Author
            </h1>
            <p className="text-xs text-app-muted font-sans mt-0.5">
              Updates to this record immediately update the public About page, home teaser, and author bio boxes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setChangePasswordModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-app-surface hover:bg-app-surface-hover text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
            title="Change administrator password"
          >
            <KeyRound className="w-4 h-4 text-primary-main" />
            <span>Change Password</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Author Profile'}</span>
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs sm:text-sm text-red-800 dark:text-red-300 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* Profile Picture Card with Live Preview & Replace/Remove */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary-main" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-app-main">
              Profile Picture
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
            {/* Live Avatar Preview */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl aspect-square overflow-hidden border-2 border-app-border bg-app-surface-hover shrink-0 relative group shadow-sm">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Author Avatar'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-app-muted text-xs text-center p-2">
                  <User className="w-8 h-8 mb-1 opacity-40" />
                  <span>No avatar</span>
                </div>
              )}
            </div>

            {/* Avatar Controls */}
            <div className="space-y-3 flex-1 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-medium transition-colors shadow-xs min-h-[44px]">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-app-surface hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 border border-app-border text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-app-muted mb-1">
                  Or paste direct image URL:
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
                />
              </div>

              <p className="text-[11px] text-app-muted">
                Accepts JPG, PNG, and WebP (max 2 MB). Live preview updates immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Personal Info */}
        <div className="card-soft p-4 sm:p-6 space-y-4 sm:space-y-5">
          <h2 className="font-serif font-bold text-base sm:text-lg text-app-main">
            Author Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                Full Name <span className="text-primary-main">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ankur"
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                Education / Academic Standing
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="Third-Year Undergraduate Student"
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>
          </div>

          {/* Short Bio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
              Short Bio (Appears in hero, footer, author cards, and teasers)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A college student who loves to write about everyday observations, books that reshape our mental models..."
              className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible resize-none"
            />
          </div>

          {/* Topics / Interests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                Topics I Explore (comma separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Student Growth, Mindfulness, Book Insights, Travel Notes"
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-xs sm:text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-app-main uppercase tracking-wider">
                Writing Themes
              </label>
              <input
                type="text"
                value={writingInterests}
                onChange={(e) => setWritingInterests(e.target.value)}
                placeholder="Personal Essays, Student Life, Habits"
                className="w-full px-3.5 py-2.5 bg-app-surface border border-app-border rounded-lg text-xs sm:text-sm text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Full Bio / Main Story on About Page */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-app-main">
              Full Bio & Personal Story
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              The comprehensive story and philosophy rendered in the main article body of the About page.
            </p>
          </div>

          <RichTextEditor
            value={fullBio}
            onChange={(html) => setFullBio(html)}
            placeholder="Write your story, why you created this blog, your writing philosophy..."
          />
        </div>

        {/* Bookshelf Section */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent-main" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-app-main">
                Books That Shaped My Thinking
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddBook}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-app-surface-hover hover:bg-app-border text-app-main text-xs sm:text-sm font-medium transition-colors min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>

          <div className="space-y-3">
            {favoriteBooks.map((book, idx) => (
              <div 
                key={idx} 
                className="p-3.5 sm:p-4 rounded-xl border border-app-border bg-app-surface-hover/50 space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-primary-main font-mono">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBook(idx)}
                    className="touch-target text-app-muted hover:text-red-600 p-1 rounded transition-colors"
                    title="Remove book"
                    aria-label="Remove book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={book.title}
                    onChange={(e) => handleBookChange(idx, 'title', e.target.value)}
                    placeholder="Book Title (e.g. Atomic Habits)"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
                  />
                  <input
                    type="text"
                    value={book.author}
                    onChange={(e) => handleBookChange(idx, 'author', e.target.value)}
                    placeholder="Author (e.g. James Clear)"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
                  />
                </div>

                <input
                  type="text"
                  value={book.note}
                  onChange={(e) => handleBookChange(idx, 'note', e.target.value)}
                  placeholder="Personal takeaway note..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Links (1-col mobile, 2-col sm+) */}
        <div className="card-soft p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary-main" />
            <h2 className="font-serif font-bold text-base sm:text-lg text-app-main">
              Social & Contact Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Email Contact</label>
              <input
                type="text"
                value={socialLinks.emailContact}
                onChange={(e) => setSocialLinks({ ...socialLinks, emailContact: e.target.value })}
                placeholder="ankur.student@example.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Twitter / X URL</label>
              <input
                type="text"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">GitHub URL</label>
              <input
                type="text"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Instagram URL</label>
              <input
                type="text"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-app-muted mb-1">Personal Website URL</label>
              <input
                type="text"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://ankur.me"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-app-surface border border-app-border rounded-lg text-app-main focus:outline-none focus:border-primary-main focus-accessible min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/admin/dashboard"
            className="text-xs sm:text-sm text-app-muted hover:text-app-main transition-colors min-h-[44px] flex items-center"
          >
            ← Return to Dashboard
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Author Profile'}</span>
          </button>
        </div>

      </form>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />

    </div>
  );
}
