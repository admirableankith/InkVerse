import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowUpRight } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

export default function ArticleCard({ post }) {
  if (!post) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const destination = `/post/${post.slug}`;

  return (
    <article className="group flex flex-col card-soft overflow-hidden hover:border-primary-main h-full">
      
      {/* Cover Image Container with fixed aspect ratio to prevent layout jumps */}
      <Link to={destination} className="relative aspect-[16/10] overflow-hidden bg-app-surface-hover block w-full">
        <img
          src={post.coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {post.status === 'draft' && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
            Draft
          </span>
        )}
      </Link>

      {/* Content Area with comfortable padding */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 lg:p-6">
        
        {/* Category & Reading Time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <CategoryBadge category={post.category} />
          <div className="flex items-center gap-1 text-xs text-app-muted font-sans shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime || '4 min read'}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-lg sm:text-xl text-app-main leading-snug mb-2.5 group-hover:text-primary-main transition-colors">
          <Link to={destination} className="line-clamp-2">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-app-muted line-clamp-3 leading-relaxed mb-6 font-sans">
          {post.excerpt}
        </p>

        {/* Card Footer with comfortable tap targets */}
        <div className="mt-auto pt-4 border-t border-app-border flex items-center justify-between text-xs text-app-muted">
          <div className="flex items-center gap-2">
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
            className="inline-flex items-center gap-1 font-semibold text-accent-main hover:text-accent-hover group/link transition-colors min-h-[44px] py-2 px-1 -my-2"
            aria-label={`Read article: ${post.title}`}
          >
            <span>Read Article</span>
            <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </article>
  );
}
