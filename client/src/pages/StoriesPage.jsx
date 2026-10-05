import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { Compass, Feather } from 'lucide-react';

export default function StoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const [cats, allPosts] = await Promise.all([
          api.getCategories(),
          api.getPosts({
            status: 'published',
            category: selectedCategory !== 'All' ? selectedCategory : undefined
          })
        ]);

        const filteredStories = allPosts.filter(p => 
          p.type === 'story' || 
          ['travel & journeys', 'personal experiences', 'stories', 'travel', 'reflections'].includes(p.category.toLowerCase())
        );

        setCategories(cats.filter(c => c.type === 'story' || c.type === 'both'));
        setStories(filteredStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [selectedCategory]);

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

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-app-border pb-6 sm:pb-8 text-center sm:text-left space-y-2.5">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-main">
          <Compass className="w-3.5 h-3.5" />
          <span>Personal Narrative</span>
        </div>
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-app-main tracking-tight">
          Personal Stories & Experiences
        </h1>
        
        <p className="text-sm sm:text-base text-app-muted max-w-2xl font-sans">
          Memories from train rides, dorm room conversations, travel notes, and vulnerable milestones from student life.
        </p>
      </div>

      {/* Story Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => handleCategorySelect('All')}
          className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border min-h-[44px] ${
            selectedCategory === 'All'
              ? 'bg-primary-main text-white border-primary-main shadow-xs'
              : 'bg-app-surface hover:bg-app-surface-hover text-app-muted hover:text-app-main border-app-border'
          }`}
        >
          All Stories
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

      {/* Stories Listing (1-col mobile, 2-col tablet, 3-col desktop) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-app-surface rounded-xl h-80 border border-app-border animate-pulse" />
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {stories.map((story) => (
            <ArticleCard key={story._id || story.slug} post={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 px-4 card-soft space-y-3">
          <Feather className="w-10 h-10 text-app-muted mx-auto" />
          <h3 className="font-serif font-bold text-lg sm:text-xl text-app-main">
            No stories published in this category yet
          </h3>
          <p className="text-xs sm:text-sm text-app-muted max-w-md mx-auto">
            Check back soon as new student tales and journey reflections are being drafted.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleCategorySelect('All')}
              className="inline-flex items-center px-4 py-2.5 bg-primary-main text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary-hover transition-colors min-h-[44px]"
            >
              Show All Stories
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
