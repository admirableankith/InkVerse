const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

async function testAuthFlow() {
  console.log('🧪 Running Comprehensive Auth, Cookie & Password Reset Test...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, msg) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
    }
  }

  const testEmail = process.env.ADMIN_EMAIL || 'discoverwithankur@gmail.com';
  const testPassword = process.env.ADMIN_PASSWORD || 'AnkurYadav04';

  // 1. Correct Login & Cookie Verification
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      rememberMe: true
    })
  });

  const loginData = await loginRes.json();
  const setCookieHeader = loginRes.headers.get('set-cookie');

  assert(loginRes.status === 200 && loginData.success, 'Login succeeded with valid admin credentials');
  assert(setCookieHeader && setCookieHeader.includes('auth_token='), 'HTTP-only auth_token cookie received in set-cookie header');
  assert(setCookieHeader && setCookieHeader.includes('HttpOnly'), 'Cookie has HttpOnly flag set');
  assert(setCookieHeader && setCookieHeader.includes('SameSite=Lax'), 'Cookie has SameSite=Lax flag set');

  const cookie = setCookieHeader.split(';')[0];

  // 2. /api/auth/me endpoint using cookie
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookie
    }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.user && meData.user.email === testEmail, '/api/auth/me returns authenticated user using cookie');

  // 3. Forgot Password endpoint
  const forgotRes = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200 && forgotData.success, 'Forgot password request processed and generic response returned');

  // 4. Test Change Password
  const tempPassword = 'TempStrongPass2026!';
  const changeRes = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookie
    },
    body: JSON.stringify({
      currentPassword: testPassword,
      newPassword: tempPassword,
      confirmPassword: tempPassword
    })
  });
  const changeData = await changeRes.json();
  assert(changeRes.status === 200 && changeData.success, 'Change password inside dashboard succeeded');

  const newSetCookie = changeRes.headers.get('set-cookie');
  assert(newSetCookie && newSetCookie.includes('auth_token='), 'Fresh auth cookie returned upon password change');
  const newCookie = newSetCookie.split(';')[0];

  // Restore original password
  const restoreRes = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': newCookie
    },
    body: JSON.stringify({
      currentPassword: tempPassword,
      newPassword: testPassword,
      confirmPassword: testPassword
    })
  });
  const restoredSetCookie = restoreRes.headers.get('set-cookie');
  const restoredCookie = restoredSetCookie.split(';')[0];

  // 5. Old session invalidation test: old cookie should be rejected
  const oldSessionCheck = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': cookie // using the initial old cookie
    }
  });
  assert(oldSessionCheck.status === 401, 'Old session token successfully invalidated after password change (tokenVersion mismatch)');

  // 6. New session works
  const newSessionCheck = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': restoredCookie
    }
  });
  assert(newSessionCheck.status === 200, 'New session cookie authenticated successfully');

  // 7. Logout test
  const logoutRes = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': restoredCookie
    }
  });
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert(logoutRes.status === 200, 'Logout succeeded');
  assert(logoutCookie && (logoutCookie.includes('auth_token=;') || logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires=')), 'Logout properly cleared auth_token cookie');

  console.log(`\n========================================`);
  console.log(`📊 Auth Flow Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testAuthFlow().catch((e) => {
  console.error('Auth test failed:', e);
  process.exit(1);
});
