#!/usr/bin/env node

const base = 'http://localhost:5000';

async function test() {
  console.log('\nTesting Doctors Endpoint...\n');
  
  try {
    const res = await fetch(`${base}/api/doctors`);
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers));
    
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
