import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import HomePage from './pages/HomePage';
import BlogsPage from './pages/BlogsPage';
import StoriesPage from './pages/StoriesPage';
import PostDetailPage from './pages/PostDetailPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPostEditorPage from './pages/AdminPostEditorPage';
import AdminAuthorEditorPage from './pages/AdminAuthorEditorPage';

// Protected Route Wrapper for Admin Area
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-app-bg text-app-main selection:bg-accent-light selection:text-accent-hover transition-colors overflow-x-hidden">
      {/* Automatic Scroll Restoration & Top Scrolling */}
      <ScrollToTop />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Area: Centered, max-w ~1200px on large screens, comfortable 16px (px-4) mobile padding */}
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/blog/:slug" element={<PostDetailPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/new"
            element={
              <ProtectedAdminRoute>
                <AdminPostEditorPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedAdminRoute>
                <AdminPostEditorPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/author"
            element={
              <ProtectedAdminRoute>
                <AdminAuthorEditorPage />
              </ProtectedAdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
