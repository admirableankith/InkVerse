import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import FeaturedCard from '../components/FeaturedCard';
import ArticleCard from '../components/ArticleCard';
import { ArrowRight, BookOpen, Feather, Coffee } from 'lucide-react';

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [allPublished, userProfile] = await Promise.all([
          api.getPosts({ status: 'published' }),
          api.getProfile().catch(() => null)
        ]);

        const featured = allPublished.filter(p => p.isFeatured);
        const displayFeatured = featured.length > 0 ? featured : allPublished.slice(0, 2);
        const restPosts = allPublished.slice(0, 6);

        setFeaturedPosts(displayFeatured);
        setLatestPosts(restPosts);
        setProfile(userProfile);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24">
      
      {/* 1. Hero Section */}
      <section className="relative pt-6 pb-6 sm:pt-12 sm:pb-10 border-b border-app-border">
        <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light dark:bg-primary-light/40 border border-primary-main/20 text-primary-main text-xs font-semibold tracking-wide uppercase">
            <Feather className="w-3.5 h-3.5" />
            <span>A Student's Writing Notebook</span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-app-main tracking-tight leading-[1.15]">
            Thoughts, Stories <br className="hidden sm:inline" />
            <span className="italic font-normal text-app-muted">& Ideas</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed font-sans px-2">
            Welcome to my personal corner on the web. I'm {profile?.name || 'Ankur'} — writing honest essays on college life, lessons from books, unexpected journeys, and finding clarity amidst the noise.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/blogs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-main hover:bg-primary-hover text-white font-semibold text-sm transition-all duration-200 shadow-sm min-h-[44px]"
            >
              <span>Explore Articles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-app-surface hover:bg-app-surface-hover text-app-main font-medium text-sm border border-app-border transition-colors shadow-2xs min-h-[44px]"
            >
              <span>About the Writer</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-main" />
              <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-app-main">
                Featured Piece
              </h2>
            </div>
          </div>

          <FeaturedCard post={featuredPosts[0]} />

          {featuredPosts.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {featuredPosts.slice(1, 3).map((post) => (
                <ArticleCard key={post._id || post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Latest Posts */}
      <section className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-app-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-primary-main" />
              <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-app-main">
                Latest Writings
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-app-muted">
              Fresh essays, reflections, and personal entries.
            </p>
          </div>

          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-main hover:text-primary-hover transition-colors min-h-[44px] py-1"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-app-surface rounded-xl h-80 border border-app-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <ArticleCard key={post._id || post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Category Discovery Highlights */}
      <section className="card-soft p-5 sm:p-8 lg:p-10 bg-app-surface-hover/50">
        <div className="max-w-2xl mx-auto text-center space-y-3 sm:space-y-4">
          <h3 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-app-main">
            What are you in the mood to read?
          </h3>
          <p className="text-xs sm:text-sm text-app-muted">
            Whether you want practical productivity tips for student life, or slow personal stories from the road.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              to="/blogs?category=College%20Life"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-app-surface hover:bg-app-surface-hover text-xs sm:text-sm font-medium text-app-main border border-app-border transition-colors shadow-2xs min-h-[44px]"
            >
              🎓 College Life
            </Link>
            <Link
              to="/stories"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-app-surface hover:bg-app-surface-hover text-xs sm:text-sm font-medium text-app-main border border-app-border transition-colors shadow-2xs min-h-[44px]"
            >
              🌲 Personal Stories
            </Link>
            <Link
              to="/blogs?category=Reflections"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-app-surface hover:bg-app-surface-hover text-xs sm:text-sm font-medium text-app-main border border-app-border transition-colors shadow-2xs min-h-[44px]"
            >
              💭 Reflections
            </Link>
            <Link
              to="/blogs?category=Books%20%26%20Ideas"
              className="inline-flex items-center px-4 py-2.5 rounded-full bg-app-surface hover:bg-app-surface-hover text-xs sm:text-sm font-medium text-app-main border border-app-border transition-colors shadow-2xs min-h-[44px]"
            >
              📚 Books & Ideas
            </Link>
          </div>
        </div>
      </section>

      {/* 5. About the Writer Teaser */}
      <section className="card-soft p-5 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
          
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden shrink-0 aspect-square border-4 border-app-border shadow-inner bg-app-surface-hover">
            <img
              src={profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={profile?.name || 'Author'}
              loading="lazy"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>

          <div className="space-y-3 sm:space-y-4 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-main uppercase tracking-wider">
              <Coffee className="w-3.5 h-3.5" />
              <span>Meet the Author</span>
            </div>
            
            <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-app-main">
              Hi, I'm {profile?.name || 'Ankur'}.
            </h3>
            
            <p className="text-xs sm:text-sm md:text-base text-app-muted leading-relaxed font-sans max-w-2xl">
              {profile?.bio || "I'm an undergraduate student navigating the intersections of academics, quiet introspection, and creative writing. This blog is my public notebook where I document what I learn along the way."}
            </p>

            <div className="pt-1 sm:pt-2">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-app-surface-hover hover:bg-app-border text-app-main text-xs sm:text-sm font-medium border border-app-border transition-colors shadow-2xs min-h-[44px]"
              >
                <span>Read My Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
