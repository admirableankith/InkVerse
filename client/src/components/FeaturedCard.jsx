import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

export default function FeaturedCard({ post }) {
  if (!post) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const destination = `/post/${post.slug}`;

  return (
    <div className="group relative card-soft overflow-hidden hover:border-primary-main">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Cover Image Container with fixed aspect ratios */}
        <Link 
          to={destination} 
          className="md:col-span-6 lg:col-span-7 relative aspect-[16/10] md:aspect-auto overflow-hidden bg-app-surface-hover block min-h-[220px] sm:min-h-[280px] md:min-h-[360px]"
        >
          <img
            src={post.coverImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Featured Story</span>
          </div>
        </Link>

        {/* Content Details */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between p-5 sm:p-7 lg:p-9">
          
          <div>
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <CategoryBadge category={post.category} />
              <span className="text-app-border">•</span>
              <div className="flex items-center gap-1 text-xs text-app-muted">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readingTime || '5 min read'}</span>
              </div>
            </div>

            <h2 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-app-main leading-tight mb-3 sm:mb-4 group-hover:text-primary-main transition-colors">
              <Link to={destination}>
                {post.title}
              </Link>
            </h2>

            <p className="text-sm sm:text-base text-app-muted leading-relaxed font-sans line-clamp-3 sm:line-clamp-4 mb-6">
              {post.excerpt}
            </p>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-app-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-app-muted">
              {post.authorAvatar && (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName || 'Author'}
                  className="w-5 h-5 rounded-full aspect-square shrink-0 object-cover border border-app-border"
                />
              )}
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>

            <Link
              to={destination}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold transition-all shadow-sm group/btn min-h-[44px]"
            >
              <span>Read Full Piece</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
