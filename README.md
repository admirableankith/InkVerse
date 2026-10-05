# Discover with Ankur — Production Personal Blogging Platform

A secure, clean, modern, and elegant personal blogging website crafted specifically for **Ankur** to write, save, edit, and publish blogs, essays, and stories.

---

## 🌟 Architecture & Features

- **Writer Space**: Tailored for personal writing, student reflections, book thoughts, and travel essays.
- **Production-Grade Security**:
  - **HTTP-Only, Secure, SameSite Cookies**: JWT tokens are securely stored in HTTP-only cookies (never accessible via JavaScript or `localStorage`).
  - **Bcrypt Password Hashing**: Password stored using high-cost salted hashes.
  - **One-Time Administrator Setup**: No passwords hardcoded in source code; administrator account is created via CLI script (`npm run create-admin`) with strict complexity rules (minimum 10 chars, letters + numbers).
  - **Password Recovery & Reset**: Secure single-use SHA-256 tokens with 30-minute expiry and branded email notifications (via Resend or SMTP), with development console link fallbacks.
  - **Session Invalidation**: Changing or resetting passwords immediately increments the user's `tokenVersion`, instantly revoking all old sessions.
  - **CSRF & Rate Limiting**: SameSite cookie policy, custom request header verification (`X-Requested-With`), and strict rate limiting on authentication routes (5 attempts per 15 minutes per IP).
  - **Security Headers & Sanitization**: Helmet HTTP headers, NoSQL query injection sanitization, and 2MB image upload restrictions with magic-byte verification.
- **Database Architecture**:
  - **Production Mode (`NODE_ENV=production`)**: Enforces persistent MongoDB (e.g., free MongoDB Atlas cluster) so content is never lost across server restarts or redeployments.
  - **Development Mode (`NODE_ENV=development`)**: Works with zero-configuration local JSON storage (`server/data/db.json`) or MongoDB.

---

## 🚀 Quick Setup & Installation

### 1. Install Dependencies
```bash
# In the project root
npm install
npm install --prefix client
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Generate a secure 64-byte random secret for `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Edit `.env` with your desired configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=paste_your_generated_64_byte_random_string_here

# Administrator Credentials for Setup
ADMIN_NAME=Ankur
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=YourStrongPassword123!

# Optional Email Delivery (Resend API or SMTP)
# RESEND_API_KEY=re_your_api_key
# EMAIL_FROM="Discover with Ankur <noreply@yourdomain.com>"
```

### 3. Create the Administrator Account (One-Time Setup)
Run the admin creation script:
```bash
npm run create-admin
```
*Note: This script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env`, validates the password strength, hashes it, and initializes your administrator record. If an admin already exists, it safely refuses to overwrite.*

### 4. Start Development Server
```bash
npm run dev
```
- **Public Website**: [http://localhost:5173](http://localhost:5173)
- **Admin Portal**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

---

## ☁️ Production Deployment & MongoDB Atlas Setup

### Step 1: Create a Free MongoDB Atlas Cluster
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster** (choose the region closest to your server).
3. Under **Security > Database Access**, create a database user (e.g. `ankur_admin`) with a secure password.
4. Under **Security > Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) or your production server's static IP.
5. Click **Connect > Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/discoverwithankur?retryWrites=true&w=majority
   ```
6. Set `MONGO_URI` in your production environment variables.

### Step 2: Build & Run in Production
```bash
# 1. Build the React frontend
npm run build

# 2. Set environment variables on your hosting provider (Render, Railway, DigitalOcean, VPS, etc.):
# NODE_ENV=production
# PORT=5000
# CLIENT_URL=https://your-domain.com
# JWT_SECRET=<your-strong-random-key>
# MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/discoverwithankur
# ADMIN_NAME=Ankur
# ADMIN_EMAIL=ankur@yourdomain.com
# ADMIN_PASSWORD=YourSecurePassword123!
# RESEND_API_KEY=re_... (optional for email resets)
# EMAIL_FROM="Discover with Ankur <noreply@yourdomain.com>"

# 3. Migrate existing local data to MongoDB (Optional / One-Time)
npm run migrate-to-mongo

# 4. Create the Administrator Account (if not already migrated)
npm run create-admin

# 5. Start the production server
npm start
```

### Step 3: Cloudinary Image Storage (Recommended for Hosting)
1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary dashboard.
3. Add them to your production environment variables:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Uploaded article covers and author avatars will automatically stream directly to Cloudinary and return permanent, global HTTPS URLs. (If omitted in local development, uploads automatically save to `server/uploads/`).

---

## 📂 Project Structure

```
DiscoverWithAnkur1/
├── package.json                 # Root dependencies & scripts (create-admin, dev, build)
├── .env.example                 # Production environment template
├── .gitignore                   # Ignores .env, uploads, and build outputs
├── README.md                    # Documentation
├── server/                      # Node.js & Express.js Backend
│   ├── index.js                 # Express server, helmet, rate-limit & CORS setup
│   ├── config/
│   │   └── db.js                # Mongo connection with production enforcement
│   ├── controllers/
│   │   ├── authController.js    # Login, profile, password reset & change
│   │   ├── postController.js    # CRUD, status toggling, view count
│   │   └── categoryController.js # Category management
│   ├── middleware/
│   │   └── auth.js              # Cookie auth & CSRF protection middleware
│   ├── models/
│   │   ├── User.js              # User model with token revocation support
│   │   ├── Post.js              # Post model
│   │   └── Category.js          # Category model
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth (with rate-limiting)
│   │   ├── postRoutes.js        # /api/posts
│   │   ├── categoryRoutes.js    # /api/categories
│   │   └── uploadRoutes.js      # /api/upload (magic byte validation, 2MB max)
│   ├── scripts/
│   │   └── createAdmin.js       # CLI script: npm run create-admin
│   └── utils/
│       └── email.js             # Resend, SMTP & dev console email engine
└── client/                      # Vite + React + Tailwind Frontend
    ├── src/
    │   ├── App.jsx              # Routing & ProtectedAdminRoute
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Cookie-based auth state
    │   │   └── ThemeContext.jsx # Dark/Light theme toggle
    │   ├── services/
    │   │   └── api.js           # Fetch API client (credentials: include)
    │   ├── components/
    │   │   ├── Navbar.jsx       # Header with dynamic session indicators
    │   │   ├── Footer.jsx       # Responsive footer
    │   │   ├── ScrollToTop.jsx  # Smooth scroll restoration
    │   │   └── ChangePasswordModal.jsx # Authenticated password changer
    │   └── pages/
    │       ├── AdminLoginPage.jsx     # Production sign-in page
    │       ├── ForgotPasswordPage.jsx # Password recovery request
    │       ├── ResetPasswordPage.jsx  # Token-based password reset
    │       ├── AdminDashboardPage.jsx # Admin management dashboard
    │       ├── AdminAuthorEditorPage.jsx # Author bio & book manager
    │       └── AdminPostEditorPage.jsx   # Rich text post editor
```

---

## 🔒 Security Checklist & Pre-Handover

- [x] No hardcoded passwords, emails, or JWT secrets in code or repository.
- [x] Passwords hashed with bcrypt (salt cost 12).
- [x] HTTP-only, SameSite cookies used for authentication (no token in localStorage).
- [x] Password reset with 30-minute expiration and SHA-256 single-use tokens.
- [x] Changing/resetting password revokes all prior login sessions.
- [x] Strict rate limiting on login & password reset routes (5 attempts / 15 mins).
- [x] Helmet security headers & NoSQL injection sanitization active.
- [x] Upload route validates genuine image file magic bytes and limits size to 2 MB.
- [x] Production mode strictly requires `MONGO_URI` to prevent data loss.
