// All calls to the StudyRoom API go through here.
// The base URL comes from VITE_API_URL (see client/.env.example).
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');

if (!import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL is not set, using http://localhost:3000/api. Copy client/.env.example to client/.env.');
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Fired when the server rejects our token (expired / user deleted) so AuthContext can log out
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    ...(options.body && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError("Can't reach the server. Check that it's running and try again.", 0);
  }

  // 204 No Content (e.g. after DELETE) has no body
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(data?.error || data?.message || `Request failed (${response.status})`, response.status);
  }

  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  auth: {
    login: (email, password) => apiFetch('/auth/login', json('POST', { email, password })),
    register: (username, email, password) => apiFetch('/auth/register', json('POST', { username, email, password })),
  },
  rooms: {
    list: () => apiFetch('/rooms'),
    get: (id) => apiFetch(`/rooms/${id}`),
    create: (room) => apiFetch('/rooms', json('POST', room)),
    update: (id, changes) => apiFetch(`/rooms/${id}`, json('PUT', changes)),
    remove: (id) => apiFetch(`/rooms/${id}`, { method: 'DELETE' }),
  },
  messages: {
    list: (roomId) => apiFetch(`/rooms/${roomId}/messages`),
    send: (roomId, content) => apiFetch(`/rooms/${roomId}/messages`, json('POST', { content })),
    remove: (roomId, messageId) => apiFetch(`/rooms/${roomId}/messages/${messageId}`, { method: 'DELETE' }),
  },
};
