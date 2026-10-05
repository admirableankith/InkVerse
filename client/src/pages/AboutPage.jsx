import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, GraduationCap, Heart, Mail, 
  Feather, Edit3, Globe 
} from 'lucide-react';

const TwitterIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AboutPage() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const favoriteBooks = profile?.favoriteBooks?.length > 0 ? profile.favoriteBooks : [
    { title: 'The Anthropocene Reviewed', author: 'John Green', note: 'A beautiful masterclass in noticing small wonders in everyday life.' },
    { title: 'Atomic Habits', author: 'James Clear', note: 'Changed how I design my morning routine during heavy semester exam weeks.' },
    { title: 'Bird by Bird', author: 'Anne Lamott', note: 'Honest, funny, and deeply reassuring advice on writing and living.' },
    { title: 'Letters to a Young Poet', author: 'Rainer Maria Rilke', note: 'A timeless reminder to love the questions themselves.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10 sm:space-y-14 lg:space-y-16 pb-12 sm:pb-16">
      
      {/* Admin Quick Edit Bar */}
      {isAuthenticated && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-primary-subtle/50 dark:bg-primary-subtle/20 rounded-xl border border-primary-main/30 text-xs animate-fade-in">
          <span className="font-medium text-app-main">
            Viewing live public About page as Admin
          </span>
          <Link
            to="/admin/author"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-main hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-2xs min-h-[44px]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Author Content</span>
          </Link>
        </div>
      )}

      {/* Header Profile Introduction (Stacked on mobile, row on sm+) */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 border-b border-app-border pb-10 sm:pb-12">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 aspect-square border-4 border-app-surface shadow-md bg-app-surface-hover">
          <img
            src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
            alt={profile?.name || 'Author'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';
            }}
          />
        </div>

        <div className="space-y-3.5 text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light dark:bg-primary-light/40 text-primary-main text-xs font-semibold">
            <Feather className="w-3.5 h-3.5" />
            <span>{profile?.education || 'Undergraduate Student & Essayist'}</span>
          </div>

          <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-app-main">
            Hello, I'm {profile?.name || 'Ankur'}.
          </h1>

          <p className="text-sm sm:text-base text-app-muted leading-relaxed font-sans">
            {profile?.bio || "I am a college student who loves to write about everyday observations, books that reshape our mental models, and honest reflections on growing up."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 pt-1 text-app-muted">
            {profile?.socialLinks?.twitter && (
              <a 
                href={profile.socialLinks.twitter} 
                target="_blank" 
                rel="noreferrer" 
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            )}
            {profile?.socialLinks?.github && (
              <a 
                href={profile.socialLinks.github} 
                target="_blank" 
                rel="noreferrer" 
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            )}
            {profile?.socialLinks?.linkedin && (
              <a 
                href={profile.socialLinks.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            )}
            {profile?.socialLinks?.instagram && (
              <a 
                href={profile.socialLinks.instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {profile?.socialLinks?.website && (
              <a 
                href={profile.socialLinks.website} 
                target="_blank" 
                rel="noreferrer" 
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-app-main">
          Why This Space Exists
        </h2>
        
        {profile?.fullBio ? (
          <div 
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: profile.fullBio }}
          />
        ) : (
          <div className="article-prose">
            <p>
              When I started college, I felt overwhelmed by how quickly days seemed to evaporate between assignment deadlines, lecture halls, and social commitments. I realized that unless I deliberately paused to capture my thoughts, whole semesters would pass without me truly processing what I was learning.
            </p>
            <p>
              This website is my personal notebook in public. It isn't intended to be a corporate portfolio or a hyper-optimized publishing empire. It's simply a calm, quiet haven where I can share essays about books, small travel journeys, campus stories, and reflections on navigating early adulthood.
            </p>
            <blockquote>
              "We do not write in order to be understood; we write in order to understand what we are actually experiencing."
            </blockquote>
          </div>
        )}
      </section>

      {/* Education & Writing Interests Grid (1-col mobile, 2-col tablet/desktop) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Education Box */}
        <div className="card-soft p-5 sm:p-6 space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-app-main">
            Education
          </h3>
          <p className="text-xs sm:text-sm text-app-muted font-sans leading-relaxed">
            {profile?.education || 'Third-Year Undergraduate Student'}
          </p>
          <p className="text-xs text-app-muted font-sans">
            Balancing coursework with independent reading, creative writing, and student community initiatives.
          </p>
        </div>

        {/* What I Love Writing About */}
        <div className="card-soft p-5 sm:p-6 space-y-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base sm:text-lg text-app-main">
            Topics I Explore
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(profile?.interests?.length > 0 ? profile.interests : ['Student Growth', 'Mindfulness', 'Book Insights', 'Travel Notes', 'Dorm Reflections', 'Habit Systems']).map((item, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-app-surface-hover text-app-main text-xs font-medium rounded-md border border-app-border"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

      </section>

      {/* Bookshelf Section (1-col mobile, 2-col sm+) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-main" />
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-app-main">
            Books That Shaped My Thinking
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteBooks.map((book, i) => (
            <div
              key={i}
              className="card-soft p-4 sm:p-5 space-y-1.5 hover:border-primary-main transition-colors"
            >
              <h4 className="font-serif font-bold text-base text-app-main">
                {book.title}
              </h4>
              <p className="text-xs font-semibold text-primary-main font-sans">
                by {book.author}
              </p>
              {book.note && (
                <p className="text-xs text-app-muted font-sans leading-relaxed pt-1">
                  "{book.note}"
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="card-soft p-6 sm:p-8 text-center space-y-3 sm:space-y-4 bg-app-surface-hover/60 scroll-mt-24">
        <h3 className="font-serif font-bold text-lg sm:text-xl text-app-main">
          Want to share a thought or say hello?
        </h3>
        <p className="text-xs sm:text-sm text-app-muted max-w-md mx-auto font-sans leading-relaxed">
          I always enjoy receiving thoughtful emails from readers, fellow students, and anyone with a good book recommendation.
        </p>
        <div className="pt-2">
          <a
            href={`mailto:${profile?.socialLinks?.emailContact || 'ankur.student@example.com'}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-medium transition-colors shadow-sm min-h-[44px]"
          >
            <Mail className="w-4 h-4" />
            <span>Send an Email</span>
          </a>
        </div>
      </section>

    </div>
  );
}
