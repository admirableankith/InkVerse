const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { csrfProtection } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust reverse proxy in production (for secure cookies, rate limiting, and HTTPS detection)
if (isProduction) {
  app.set('trust proxy', 1);
}

// 1. Helmet Security Headers (Configured for content security, images & fonts)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.unsplash.com', 'https://res.cloudinary.com', 'https://*.cloudinary.com'],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173']
    }
  }
}));

// 2. Cookie Parser
app.use(cookieParser());

// 3. CORS Configuration with credentials
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (tools/curl) or matching client URLs
    if (!origin || origin === clientUrl || (!isProduction && (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Blog-Client']
}));

// 4. Body Parsers with safe payload limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 5. Input Sanitizer (Prevents NoSQL injection by recursively stripping $ and dot operators)
function sanitizeInput(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      sanitizeInput(obj[key]);
    }
  }
  return obj;
}

app.use((req, res, next) => {
  if (req.body) sanitizeInput(req.body);
  if (req.query) sanitizeInput(req.query);
  if (req.params) sanitizeInput(req.params);
  next();
});

// 6. General API Rate Limiting (300 requests per 15 mins)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP address. Please try again later.' }
});
app.use('/api', apiLimiter);

// 7. CSRF Protection for state-changing requests
app.use('/api', csrfProtection);

// 8. Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 9. Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Discover With Ankur - Production Blog API',
    database: process.env.MONGO_URI ? 'mongodb' : 'json-fallback'
  });
});

// 10. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 11. 404 Handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// 12. Serve built React frontend from client/dist and provide SPA catch-all in production
if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));

  // Catch-all route to serve index.html for client-side routing (e.g. /about, /blogs/:slug, /admin/login)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 13. Global Error Handler
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Server Error:', err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server'
  });
});

// Start Express server and connect Database
app.listen(PORT, async () => {
  console.log(`🚀 Discover With Ankur Blog API running on http://localhost:${PORT}`);
  await connectDB().catch(err => {
    console.error('Database connection error:', err.message);
  });
});
