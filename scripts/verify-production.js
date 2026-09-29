/**
 * CodePulse Production Verification Suite
 * Verifies live server health, authentication, data integrity, security headers, and API endpoints.
 */

const BASE_URL = process.argv[2] || process.env.TARGET_URL || process.env.BACKEND_URL || 'http://localhost:5000';

async function testEndpoint(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    let body = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    return { ok: res.ok, status: res.status, headers: res.headers, body };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function runVerification() {
  console.log('='.repeat(60));
  console.log(`[CodePulse Verification] Target: ${BASE_URL}`);
  console.log(`[CodePulse Verification] Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // 1. Health Endpoint
  console.log('\n--- 1. Health & Availability ---');
  const healthRes = await testEndpoint('Health Check', `${BASE_URL}/health`);
  assert(healthRes.ok && (healthRes.body?.status === 'ok' || healthRes.body?.status === 'healthy'), 'Root /health endpoint returns 200 OK', JSON.stringify(healthRes.body));
  
  const apiHealthRes = await testEndpoint('API Health Check', `${BASE_URL}/api/health`);
  assert(apiHealthRes.ok && apiHealthRes.body?.status === 'ok', '/api/health endpoint returns 200 OK');

  // 2. Security Headers (Helmet)
  console.log('\n--- 2. Security Headers (Helmet) ---');
  if (healthRes.headers) {
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff present');
    assert(!!healthRes.headers.get('x-frame-options') || !!healthRes.headers.get('content-security-policy'), 'Frame Protection (X-Frame-Options or CSP) present');
  }

  // 3. User Authentication Flow
  console.log('\n--- 3. Authentication & JWT ---');
  const testEmail = `test_${Date.now()}@codepulse.dev`;
  const testPassword = 'SecurePassword123!';
  
  // Register
  const registerRes = await testEndpoint('Register User', `${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Bot',
      email: testEmail,
      password: testPassword,
      headline: 'Automated QA Engineer'
    })
  });
  assert(registerRes.ok && registerRes.body?.success, 'POST /api/auth/register returns 201/200 & success: true', JSON.stringify(registerRes.body));

  // Login
  const loginRes = await testEndpoint('Login User', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  const token = loginRes.body?.data?.token;
  assert(loginRes.ok && token, 'POST /api/auth/login returns valid JWT token', JSON.stringify(loginRes.body));

  // Authenticated Me
  const meRes = await testEndpoint('Authenticated Profile /api/auth/me', `${BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert(meRes.ok && meRes.body?.data?.user?.email === testEmail, 'GET /api/auth/me resolves user from Bearer JWT');

  // 4. Data Endpoints & Zero Mock Verification
  console.log('\n--- 4. Platform Data & Live Analytics ---');
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const statsRes = await testEndpoint('Dashboard Stats', `${BASE_URL}/api/stats`, { headers: authHeaders });
  assert(statsRes.ok && statsRes.body?.success, 'GET /api/stats returns status 200');

  const platformsRes = await testEndpoint('Connected Platforms', `${BASE_URL}/api/platforms`, { headers: authHeaders });
  assert(platformsRes.ok && Array.isArray(platformsRes.body?.data), 'GET /api/platforms returns platform cards array');

  const problemsRes = await testEndpoint('Tracked Problems', `${BASE_URL}/api/problems?limit=5`, { headers: authHeaders });
  assert(problemsRes.ok && Array.isArray(problemsRes.body?.data), 'GET /api/problems returns problem entries array');

  // 5. Dedicated Modular Endpoints
  console.log('\n--- 5. Modular Domain Endpoints ---');
  const streaksRes = await testEndpoint('Streaks Endpoint', `${BASE_URL}/api/streaks`, { headers: authHeaders });
  assert(streaksRes.ok && streaksRes.body?.success, 'GET /api/streaks returns streak metrics');

  const progressRes = await testEndpoint('Progress Endpoint', `${BASE_URL}/api/progress`, { headers: authHeaders });
  assert(progressRes.ok && progressRes.body?.success, 'GET /api/progress returns growth history');

  const leetcodeRes = await testEndpoint('LeetCode Direct', `${BASE_URL}/api/leetcode`, { headers: authHeaders });
  assert(leetcodeRes.ok && leetcodeRes.body?.success, 'GET /api/leetcode returns platform metrics');

  const codechefRes = await testEndpoint('CodeChef Direct', `${BASE_URL}/api/codechef`, { headers: authHeaders });
  assert(codechefRes.ok && codechefRes.body?.success, 'GET /api/codechef returns platform metrics');

  const gfgRes = await testEndpoint('GFG Direct', `${BASE_URL}/api/gfg`, { headers: authHeaders });
  assert(gfgRes.ok && gfgRes.body?.success, 'GET /api/gfg returns platform metrics');

  const codeforcesRes = await testEndpoint('Codeforces Direct', `${BASE_URL}/api/codeforces`, { headers: authHeaders });
  assert(codeforcesRes.ok && codeforcesRes.body?.success, 'GET /api/codeforces returns platform metrics');

  const githubRes = await testEndpoint('GitHub Integration', `${BASE_URL}/api/github`, { headers: authHeaders });
  assert(githubRes.ok && githubRes.body?.success, 'GET /api/github returns GitHub status');

  console.log('\n' + '='.repeat(60));
  console.log(`[CodePulse Verification Results] PASSED: ${passed} | FAILED: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('[Fatal Error] Verification failed:', err);
  process.exit(1);
});
