const jwt = require('jsonwebtoken');
const { Storage } = require('../data/storage');

const JWT_SECRET = process.env.JWT_SECRET || 'ankur_super_secret_blog_key_2026';

/**
 * Extract token from HTTP-only cookie or Authorization header
 */
function extractToken(req) {
  if (req.cookies && (req.cookies.auth_token || req.cookies.token)) {
    return req.cookies.auth_token || req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

/**
 * Mandatory Authentication Middleware for Admin / Mutating endpoints
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate that user still exists and token hasn't been revoked
    const user = await Storage.getUserById(decoded.id) || await Storage.getUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    // Check tokenVersion / passwordChangedAt for session invalidation after password reset
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined) {
      if (decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ message: 'Session expired due to security update. Please log in again.' });
      }
    }

    if (user.passwordChangedAt && decoded.iat) {
      const changedTimestamp = parseInt(new Date(user.passwordChangedAt).getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({ message: 'Password was recently changed. Please log in again.' });
      }
    }

    req.user = {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid authentication session. Please log in.' });
  }
};

/**
 * Optional Authentication Middleware for Public Post listings & previews
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await Storage.getUserById(decoded.id) || await Storage.getUserByEmail(decoded.email);
      if (user) {
        if (decoded.tokenVersion === undefined || user.tokenVersion === undefined || decoded.tokenVersion === user.tokenVersion) {
          req.user = {
            id: user._id || user.id,
            email: user.email,
            name: user.name
          };
        }
      }
    }
  } catch (error) {
    // Non-authenticated guest: ignore error and continue
  }
  next();
};

/**
 * CSRF Protection Middleware
 * Requires custom header on non-safe HTTP methods (POST, PUT, PATCH, DELETE)
 */
const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Check custom request header or origin
  const customHeader = req.headers['x-requested-with'] || req.headers['x-blog-client'];
  const origin = req.headers['origin'] || req.headers['referer'];
  const clientUrl = process.env.CLIENT_URL;

  if (customHeader) {
    return next();
  }

  // If origin matches CLIENT_URL or localhost in development
  if (origin && clientUrl && origin.startsWith(clientUrl)) {
    return next();
  }

  if (process.env.NODE_ENV !== 'production' && origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return next();
  }

  // Reject potential CSRF requests lacking custom header or valid origin
  return res.status(403).json({
    message: 'Cross-Site Request Forgery safeguard: Missing required security header.'
  });
};

module.exports = {
  authMiddleware,
  optionalAuth,
  csrfProtection,
  JWT_SECRET
};
