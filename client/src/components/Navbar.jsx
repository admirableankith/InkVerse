import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, PenTool, LayoutDashboard, LogIn, 
  LogOut, Menu, X, User, Sun, Moon 
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Stories', path: '/stories' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !e.target.closest('#mobile-menu-button')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      // Prevent body scrolling when mobile drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-app-surface/95 backdrop-blur-md border-b border-app-border transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group py-2 focus-accessible rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-primary-light dark:bg-primary-light/40 border border-primary-main/20 flex items-center justify-center text-primary-main group-hover:bg-primary-main group-hover:text-white transition-all duration-200 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-app-main group-hover:text-primary-main transition-colors leading-tight">
                Discover with Ankur
              </span>
              <span className="text-[11px] font-sans tracking-wide uppercase text-app-muted font-medium">
                Personal Writing & Essays
              </span>
            </div>
          </Link>

          {/* Desktop & Tablet Navigation Links (Full horizontal navbar for >= 640px) */}
          <nav className="hidden sm:flex items-center gap-5 md:gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm md:text-base font-medium transition-colors duration-150 relative py-2 px-1 focus-accessible rounded-md ${
                  isActive(link.path)
                    ? 'text-primary-main font-semibold'
                    : 'text-app-muted hover:text-app-main'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-main rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Action / Dark Mode Toggle & Admin (Tablet & Desktop >= 640px) */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3">
            
            {/* Dark Mode Toggle (Min 44x44px target) */}
            <button
              onClick={toggleTheme}
              type="button"
              className="touch-target rounded-full text-app-muted hover:text-app-main hover:bg-app-surface-hover transition-colors focus-accessible"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/author"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-app-surface-hover text-app-main border border-app-border hover:border-primary-main transition-colors min-h-[44px]"
                  title="Edit Author Record"
                >
                  <User className="w-4 h-4 text-primary-main" />
                  <span>Author</span>
                </Link>

                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-app-surface-hover text-app-main border border-app-border hover:border-primary-main transition-colors min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 text-primary-main" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>

                <Link
                  to="/admin/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-primary-main hover:bg-primary-hover text-white transition-colors shadow-2xs min-h-[44px]"
                >
                  <PenTool className="w-4 h-4" />
                  <span className="hidden md:inline">New Post</span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="touch-target rounded-full text-app-muted hover:text-red-600 hover:bg-app-surface-hover transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs md:text-sm font-medium text-app-muted hover:text-app-main px-3 py-2 rounded-lg hover:bg-app-surface-hover transition-colors min-h-[44px]"
              >
                <LogIn className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile Actions & Hamburger Toggle (< 640px) */}
          <div className="flex sm:hidden items-center gap-1">
            {/* Theme Toggle Button (44x44px) */}
            <button
              onClick={toggleTheme}
              type="button"
              className="touch-target rounded-lg text-app-muted hover:text-app-main active:bg-app-surface-hover"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {isAuthenticated && (
              <Link
                to="/admin/dashboard"
                className="touch-target rounded-lg text-app-main active:bg-app-surface-hover"
                title="Dashboard"
                aria-label="Admin Dashboard"
              >
                <LayoutDashboard className="w-5 h-5 text-primary-main" />
              </Link>
            )}

            {/* Hamburger Button (44x44px) */}
            <button
              id="mobile-menu-button"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target rounded-lg text-app-main hover:bg-app-surface-hover active:bg-app-surface-hover focus-accessible"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay + Menu (< 640px) */}
      {mobileMenuOpen && (
        <div 
          className="sm:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-xs z-50 animate-fade-in"
          aria-hidden={!mobileMenuOpen}
        >
          <div 
            ref={menuRef}
            id="mobile-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="border-b border-app-border bg-app-surface px-5 pt-3 pb-8 space-y-4 shadow-xl animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <nav className="flex flex-col space-y-1" aria-label="Mobile Menu Links">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center min-h-[48px] px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-light dark:bg-primary-light/40 text-primary-main font-semibold'
                      : 'text-app-main hover:bg-app-surface-hover active:bg-app-surface-hover'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-app-border">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/admin/author"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium bg-app-surface-hover text-app-main active:bg-app-border"
                  >
                    <User className="w-4 h-4 text-primary-main" />
                    <span>Edit Author Profile</span>
                  </Link>

                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium bg-app-surface-hover text-app-main active:bg-app-border"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary-main" />
                    <span>Writer Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 min-h-[48px] px-4 py-3 rounded-xl text-sm font-semibold bg-primary-main text-white active:bg-primary-hover shadow-sm"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Create New Post</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 active:bg-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-h-[48px] px-4 py-3 rounded-xl text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-surface-hover active:bg-app-surface-hover"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Admin Writer Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
