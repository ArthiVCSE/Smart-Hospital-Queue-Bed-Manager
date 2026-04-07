#!/usr/bin/env node

const base = 'http://localhost:5000';

async function testApi() {
  console.log('\n🏥 Testing Hospital Queue API\n');
  console.log('1️⃣  Testing Health Check...');
  try {
    const res = await fetch(`${base}/health`);
    const data = await res.json();
    console.log('✓ Health:', data);
  } catch (err) {
    console.error('✗ Health check failed:', err.message);
  }

  console.log('\n2️⃣  Testing Registration...');
  try {
    const res = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Patient',
        email: 'john@hospital.com',
        password: 'password123',
      }),
    });
    const data = await res.json();
    if (res.ok && data.data && data.data.token) {
      console.log('✓ Registration successful');
      console.log('  Token:', data.data.token.substring(0, 20) + '...');
      return data.data.token;
    } else {
      console.error('✗ Registration failed:', data);
      return null;
    }
  } catch (err) {
    console.error('✗ Registration error:', err.message);
    return null;
  }
}

testApi().then(() => {
  console.log('\n✓ API tests completed\n');
  process.exit(0);
});
