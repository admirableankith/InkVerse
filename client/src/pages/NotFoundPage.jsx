import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16 sm:py-20 px-4 space-y-6">
      <div className="w-14 h-14 rounded-full bg-primary-light dark:bg-primary-light/40 text-primary-main mx-auto flex items-center justify-center">
        <BookOpen className="w-6 h-6" />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-app-main">
          Page Not Found
        </h1>
        <p className="text-sm text-app-muted font-sans leading-relaxed">
          The page or article you're looking for doesn't exist or has moved.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-main hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
