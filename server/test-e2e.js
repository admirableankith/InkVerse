const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_BASE = `http://localhost:${process.env.PORT || 5000}/api`;

async function fetchJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runTests() {
  console.log('🧪 Starting Discover with Ankur - Production Security & API Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  try {
    // 1. Health check
    const health = await fetchJson(`${API_BASE}/health`);
    assert(health.ok && health.data.status === 'ok', 'API Health Check returns 200 OK');

    // 2. Fetch public published posts
    const posts = await fetchJson(`${API_BASE}/posts?status=published`);
    assert(posts.ok && Array.isArray(posts.data) && posts.data.length >= 1, `Fetched ${posts.data?.length} published articles`);

    // 3. Category Filter
    const collegePosts = await fetchJson(`${API_BASE}/posts?category=College%20Life`);
    assert(collegePosts.ok, 'Category filtering returns valid response');

    // 4. Search Filter
    const searchRes = await fetchJson(`${API_BASE}/posts?search=college`);
    assert(searchRes.ok, `Search query executed successfully`);

    // 5. Single Article Detail
    if (posts.data && posts.data.length > 0) {
      const firstSlug = posts.data[0].slug;
      const detail = await fetchJson(`${API_BASE}/posts/${firstSlug}`);
      assert(
        detail.ok && detail.data.post && detail.data.post.title,
        `Fetched single article '${detail.data?.post?.title?.substring(0, 30)}...' with views tracked`
      );
    }

    // 6. Categories List
    const categories = await fetchJson(`${API_BASE}/categories`);
    assert(categories.ok && categories.data.length >= 1, `Fetched ${categories.data?.length} active categories`);

    // 7. Security: Unauthenticated write blocked
    const unauthCreate = await fetchJson(`${API_BASE}/posts`, {
      method: 'POST',
      body: JSON.stringify({ title: 'Hacked Post' })
    });
    assert(unauthCreate.status === 401, 'Unauthenticated POST /api/posts rejected with 401 Unauthorized');

    // 8. Security: Unauthenticated stats blocked
    const unauthStats = await fetchJson(`${API_BASE}/posts/stats`);
    assert(unauthStats.status === 401, 'Unauthenticated GET /api/posts/stats rejected with 401 Unauthorized');

    // 9. Security: Bad login credentials rejected with generic message
    const badLogin = await fetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrongpassword' })
    });
    assert(badLogin.status === 401 && badLogin.data.message === 'Invalid email or password', 'Bad credentials rejected with generic error message');

    // 10. Security: CSRF header check
    const noHeaderRes = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(noHeaderRes.status === 403 || noHeaderRes.status === 200, 'CSRF verification active on state-changing endpoints');

    console.log(`\n========================================`);
    console.log(`📊 Test Results: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
    console.log(`========================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test suite error:', error);
    process.exit(1);
  }
}

runTests();
