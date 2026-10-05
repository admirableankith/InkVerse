import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Search, BookOpen, X } from 'lucide-react';

export default function BlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    const q = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(q);
  }, [searchParams]);

  // Load categories and posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, allPosts] = await Promise.all([
          api.getCategories(),
          api.getPosts({
            status: 'published',
            category: selectedCategory !== 'All' ? selectedCategory : undefined,
            search: searchQuery || undefined
          })
        ]);

        setCategories(cats);
        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching blog listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', catName);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-app-border pb-6 sm:pb-8 text-center sm:text-left space-y-2.5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-main">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Articles Archive</span>
        </div>
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-app-main tracking-tight">
          Blogs & Articles
        </h1>
        
        <p className="text-sm sm:text-base text-app-muted max-w-2xl font-sans">
          Curated writings on university life, daily productivity systems, book takeaways, and philosophical reflections.
        </p>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-4 sm:space-y-6">
        
        {/* Search Input (Touch friendly) */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, topic, or keyword..."
            className="w-full pl-11 pr-24 py-3 bg-app-surface border border-app-border rounded-xl text-sm text-app-main placeholder-app-muted focus:outline-none focus:border-primary-main focus-accessible shadow-2xs min-h-[44px]"
          />
          <Search className="w-4 h-4 text-app-muted absolute left-4 top-1/2 -translate-y-1/2" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('search');
                  setSearchParams(newParams);
                }}
                className="touch-target p-1 text-app-muted hover:text-app-main rounded"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary-main hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors min-h-[36px]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filters with smooth horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
              selectedCategory === 'All'
                ? 'bg-primary-main text-white border-primary-main shadow-xs'
                : 'bg-app-surface hover:bg-app-surface-hover text-app-muted hover:text-app-main border-app-border'
            }`}
          >
            All Articles
          </button>

          {categories.map((cat) => (
            <button
              key={cat._id || cat.slug}
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-primary-main text-white border-primary-main shadow-xs'
                  : 'bg-app-surface hover:bg-app-surface-hover text-app-muted hover:text-app-main border-app-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Filter Indicator */}
        {(selectedCategory !== 'All' || searchQuery) && (
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-4 bg-app-surface-hover rounded-lg text-xs text-app-muted border border-app-border">
            <span>
              Showing results for{' '}
              {selectedCategory !== 'All' && <strong className="text-app-main">"{selectedCategory}"</strong>}
              {selectedCategory !== 'All' && searchQuery && ' and '}
              {searchQuery && <strong className="text-app-main">"{searchQuery}"</strong>}
            </span>
            <button
              onClick={clearFilters}
              className="text-primary-main hover:underline font-semibold min-h-[36px] py-1"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* Articles Grid (1-col mobile, 2-col tablet, 3-col desktop) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-app-surface rounded-xl h-80 border border-app-border animate-pulse" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post) => (
            <ArticleCard key={post._id || post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 px-4 card-soft space-y-3">
          <BookOpen className="w-10 h-10 text-app-muted mx-auto" />
          <h3 className="font-serif font-bold text-lg sm:text-xl text-app-main">
            No articles found
          </h3>
          <p className="text-xs sm:text-sm text-app-muted max-w-md mx-auto">
            Try searching for different keywords or browse all available categories.
          </p>
          <div className="pt-2">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2.5 bg-primary-main text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors min-h-[44px]"
            >
              Show All Articles
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
