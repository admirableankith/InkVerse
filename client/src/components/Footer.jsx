import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-app-border bg-app-surface/60 mt-16 sm:mt-24 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 sm:mb-12">
          
          {/* Brand Info */}
          <div className="sm:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-light dark:bg-primary-light/40 flex items-center justify-center text-primary-main shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-serif font-bold text-lg text-app-main">
                Discover with Ankur
              </span>
            </div>
            <p className="text-sm text-app-muted max-w-md leading-relaxed font-sans">
              A quiet, personal corner on the web for honest student essays, life observations, travel memories, and the pursuit of lifelong curiosity.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-app-muted">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="touch-target rounded-full hover:text-primary-main hover:bg-app-surface-hover transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-app-main uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-app-muted">
              <li>
                <Link to="/" className="inline-block py-1 hover:text-primary-main transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="inline-block py-1 hover:text-primary-main transition-colors">
                  Article
                </Link>
              </li>
              <li>
                <Link to="/stories" className="inline-block py-1 hover:text-primary-main transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-block py-1 hover:text-primary-main transition-colors">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Writer Space */}
          <div>
            <h3 className="text-xs font-semibold text-app-main uppercase tracking-wider mb-4">
              Writer's Room
            </h3>
            <p className="text-xs sm:text-sm text-app-muted leading-relaxed mb-3">
              Written and curated by Ankur. If you'd like to talk about books, stories, or student life, feel free to reach out.
            </p>
            <Link
              to="/about#contact"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent-main hover:text-accent-hover hover:underline underline-offset-2 min-h-[44px] py-1"
            >
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-app-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-app-muted text-center sm:text-left">
          <p>© {currentYear} Discover with Ankur. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/admin/login" className="hover:text-app-main transition-colors py-1">
              Admin Area
            </Link>
            <span>•</span>
            <span>Crafted with words & curiosity</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
