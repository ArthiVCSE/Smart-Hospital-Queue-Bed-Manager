import { getApiBase } from './apiBase.js';

const base = getApiBase();

const jsonHeaders = {
  'Content-Type': 'application/json',
};

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }
  return payload.data;
}

export async function loginUser(body) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { ...jsonHeaders },
    body: JSON.stringify(body),
  });
}

export async function registerUser(body) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: { ...jsonHeaders },
    body: JSON.stringify(body),
  });
}

export async function getMe(token) {
  return request('/api/auth/me', {
    headers: { ...authHeaders(token) },
  });
}

export async function getDoctors() {
  return request('/api/doctors');
}

export async function getDoctorSlots(doctorId, date) {
  return request(`/api/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);
}

export async function bookAppointment(payload, token) {
  return request('/api/appointments/book', {
    method: 'POST',
    headers: { ...jsonHeaders, ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
}

export async function getQueue(doctorId, date, token) {
  return request(`/api/queue/${doctorId}?date=${encodeURIComponent(date)}`, {
    headers: { ...authHeaders(token) },
  });
}

export async function callNext(doctorId, date, token) {
  return request(`/api/queue/doctors/${doctorId}/call-next?date=${encodeURIComponent(date)}`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
}

export async function completeConsult(appointmentId, token) {
  return request(`/api/queue/appointments/${appointmentId}/complete`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
}

export async function getBeds(token) {
  return request('/api/beds', {
    headers: { ...authHeaders(token) },
  });
}

export async function createBed(payload, token) {
  return request('/api/beds', {
    method: 'POST',
    headers: { ...jsonHeaders, ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
}

export async function assignBed(bedId, payload, token) {
  return request(`/api/beds/${bedId}/assign`, {
    method: 'POST',
    headers: { ...jsonHeaders, ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
}

export async function reserveBed(bedId, token) {
  return request(`/api/beds/${bedId}/reserve`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
}

export async function dischargeBed(bedId, token) {
  return request(`/api/beds/${bedId}/discharge`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
}
