const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Storage } = require('../data/storage');
const { JWT_SECRET } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    fullBio: user.fullBio,
    avatar: user.avatar,
    education: user.education,
    interests: user.interests || [],
    writingInterests: user.writingInterests || [],
    favoriteBooks: user.favoriteBooks || [],
    socialLinks: user.socialLinks || {}
  };
}

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 10) {
    return 'Password must be at least 10 characters long.';
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return 'Password must contain both letters and numbers.';
  }
  return null;
}

// 1. Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = await Storage.getUserByEmail(email);
    if (!user || !user.password) {
      // Intentionally generic to prevent user enumeration
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Secure bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate signed JWT
    const token = jwt.sign(
      {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        tokenVersion: user.tokenVersion || 0
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/'
    };

    if (rememberMe !== false) {
      cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    }

    res.cookie('auth_token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during authentication.' });
  }
};

// 2. Get Current Authenticated User (/api/auth/me)
exports.getMe = async (req, res) => {
  try {
    const user = await Storage.getUserById(req.user.id) || await Storage.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Error retrieving user session' });
  }
};

// 3. Logout Controller
exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/'
  });
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// 4. Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Storage.getUserByEmail(normalizedEmail);

    if (user) {
      // Generate secure 32-byte random hex token
      const resetToken = crypto.randomBytes(32).toString('hex');
      // Hash token for database storage
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set expiry to 30 minutes
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await Storage.updateUser({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt
      });

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/admin/reset-password/${resetToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
      });
    }

    // Always respond with identical message to prevent email enumeration
    res.json({
      success: true,
      message: 'If this email is registered, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Error processing password reset request.' });
  }
};

// 5. Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Hash the token from URL to match database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await Storage.getUserByResetToken(hashedToken);

    if (!user) {
      return res.status(400).json({
        message: 'Password reset link is invalid or has expired. Please request a new one.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user, invalidate old sessions
    await Storage.updateUser({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      passwordChangedAt: new Date(),
      tokenVersion: (user.tokenVersion || 0) + 1
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
};

// 6. Change Password Controller (Authenticated Admin)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return res.status(400).json({ message: strengthError });
    }

    const user = await Storage.getUserById(req.user.id) || await Storage.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const nextTokenVersion = (user.tokenVersion || 0) + 1;

    await Storage.updateUser({
      password: hashedPassword,
      passwordChangedAt: new Date(),
      tokenVersion: nextTokenVersion
    });

    // Issue fresh cookie with updated tokenVersion
    const newToken = jwt.sign(
      {
        id: user._id || user.id,
        email: user.email,
        name: user.name,
        tokenVersion: nextTokenVersion
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ message: 'Error changing password.' });
  }
};

// 7. Get Public Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await Storage.getUser();
    if (!user) {
      return res.status(404).json({ message: 'Author profile not found' });
    }
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// 8. Update Public Profile (Admin)
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, bio, fullBio, avatar, education, 
      interests, writingInterests, favoriteBooks, socialLinks 
    } = req.body;

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (bio !== undefined) updatePayload.bio = bio.trim();
    if (fullBio !== undefined) updatePayload.fullBio = fullBio;
    if (avatar !== undefined) updatePayload.avatar = avatar.trim();
    if (education !== undefined) updatePayload.education = education.trim();
    
    if (interests !== undefined) {
      updatePayload.interests = Array.isArray(interests) 
        ? interests 
        : (interests ? interests.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    
    if (writingInterests !== undefined) {
      updatePayload.writingInterests = Array.isArray(writingInterests) 
        ? writingInterests 
        : (writingInterests ? writingInterests.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    
    if (favoriteBooks !== undefined) {
      updatePayload.favoriteBooks = Array.isArray(favoriteBooks) 
        ? favoriteBooks.filter(b => b && b.title && b.title.trim() && b.author && b.author.trim())
        : [];
    }
    
    if (socialLinks !== undefined && typeof socialLinks === 'object') {
      updatePayload.socialLinks = socialLinks;
    }

    const updated = await Storage.updateUser(updatePayload);
    res.json({
      success: true,
      message: 'Author profile updated successfully',
      user: sanitizeUser(updated)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
