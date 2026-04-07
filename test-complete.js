#!/usr/bin/env node

const base = 'http://localhost:5000';

// Test credentials from seed script
const testUsers = {
  admin: { email: 'admin@demo.hospital', password: 'Admin1234!' },
  doctor: { email: 'dr.arya@demo.hospital', password: 'Doctor1234!' },
  patient: { email: 'patient1@demo.hospital', password: 'Patient1234!' },
};

async function request(path, options = {}) {
  try {
    const res = await fetch(`${base}${path}`, options);
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  }
}

async function runTests() {
  console.log('\n🏥 HOSPITAL QUEUE API - COMPLETE TEST SUITE\n');

  let adminToken, doctorToken, patientToken;

  // 1. Test Health
  console.log('1️⃣  Health Check');
  let result = await request('/health');
  console.log(result.ok ? '  ✓ Server is running' : '  ✗ Server unreachable');

  // 2. Test Login
  console.log('\n2️⃣  Testing Login');
  console.log('  Testing admin login...');
  result = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.admin),
  });
  if (result.ok && result.data?.data?.token) {
    adminToken = result.data.data.token;
    console.log('    ✓ Admin login successful');
  } else {
    console.log('    ✗ Admin login failed:', result.data?.message);
  }

  console.log('  Testing doctor login...');
  result = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.doctor),
  });
  if (result.ok && result.data?.data?.token) {
    doctorToken = result.data.data.token;
    console.log('    ✓ Doctor login successful');
  } else {
    console.log('    ✗ Doctor login failed:', result.data?.message);
  }

  console.log('  Testing patient login...');
  result = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers.patient),
  });
  if (result.ok && result.data?.data?.token) {
    patientToken = result.data.data.token;
    console.log('    ✓ Patient login successful');
  } else {
    console.log('    ✗ Patient login failed:', result.data?.message);
  }

  // 3. Test Doctors Endpoint
  console.log('\n3️⃣  Doctors Endpoint');
  result = await request('/api/doctors');
  if (result.ok && result.data?.doctors) {
    console.log(`  ✓ Found ${result.data.doctors.length} doctors`);
  } else {
    console.log('  ✗ Failed to fetch doctors');
  }

  // 4. Test Beds Endpoint (admin only)
  console.log('\n4️⃣  Beds Endpoint (Admin)');
  result = await request('/api/beds', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (result.ok) {
    console.log(`  ✓ Admin can access beds - ${result.data?.beds?.length || 0} beds`);
  } else {
    console.log('  ✗ Admin beds access failed:', result.data?.message);
  }

  // 5. Test Queue Endpoint
  console.log('\n5️⃣  Queue Endpoint');
  if (result.ok && result.data?.beds?.length) {
    const doctorId = result.data.beds[0]?.doctorId || 'test-id';
    const date = '2026-04-07';
    result = await request(`/api/queue/${doctorId}?date=${date}`);
    if (result.ok) {
      console.log(`  ✓ Queue accessible - ${result.data?.queue?.length || 0} appointments`);
    } else {
      console.log('  ✗ Queue access failed');
    }
  }

  console.log('\n===========================================');
  console.log('✓ TEST SUMMARY');
  console.log('===========================================');
  console.log('\n📝 Test Credentials (from seed):\n');
  console.log('Admin:');
  console.log(`  Email: ${testUsers.admin.email}`);
  console.log(`  Password: ${testUsers.admin.password}\n`);
  console.log('Doctor:');
  console.log(`  Email: ${testUsers.doctor.email}`);
  console.log(`  Password: ${testUsers.doctor.password}\n`);
  console.log('Patient:');
  console.log(`  Email: ${testUsers.patient.email}`);
  console.log(`  Password: ${testUsers.patient.password}\n`);
  console.log('===========================================\n');
}

runTests();
