// Frontend API Client for Phố Ẩm Thực Website
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'web-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

// Authentication
export const authAPI = {
  register: (email, password, fullName) =>
    fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, deviceId: getDeviceId() })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId: getDeviceId() })
    }).then(r => r.json()),

  changePassword: (currentPassword, newPassword) =>
    authFetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data?.message || 'Failed to change password');
      }
      return data;
    }),

  logout: () =>
    authFetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST' })
      .then(r => r.json())
      .then(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
};

// POIs
export const poisAPI = {
  getAll: (page = 1, limit = 20) =>
    authFetch(`${API_BASE_URL}/api/v1/pois?page=${page}&limit=${limit}`)
      .then(r => r.json()),

  getById: (poiId) =>
    authFetch(`${API_BASE_URL}/api/v1/pois/${poiId}`)
      .then(r => r.json()),

  getFeatured: (limit = 6) =>
    authFetch(`${API_BASE_URL}/api/v1/pois/featured?limit=${limit}`)
      .then(r => r.json())
      .then(res => res?.data ?? []),

  searchByRadius: (latitude, longitude, radiusM, limit = 20) =>
    authFetch(`${API_BASE_URL}/api/v1/pois/search/radius`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, radiusM, limit })
    }).then(r => r.json()),

  getByBounds: (north, south, east, west) =>
    authFetch(`${API_BASE_URL}/api/v1/pois/bounds`, {
      method: 'POST',
      body: JSON.stringify({ north, south, east, west })
    })
      .then(r => r.json())
      .then(res => res?.data ?? [])
};

// Tours
export const toursAPI = {
  getAll: (page = 1, limit = 20) =>
    authFetch(`${API_BASE_URL}/api/v1/tours?page=${page}&limit=${limit}`)
      .then(r => r.json()),

  getById: (tourId) =>
    authFetch(`${API_BASE_URL}/api/v1/tours/${tourId}`)
      .then(r => r.json()),

  getFeatured: (limit = 4) =>
    authFetch(`${API_BASE_URL}/api/v1/tours/featured?limit=${limit}`)
      .then(r => r.json())
      .then(res => res?.data ?? [])
};

// Search
export const searchAPI = {
  global: (query, type = 'poi,tour', limit = 20) =>
    authFetch(
      `${API_BASE_URL}/api/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`
    ).then(r => r.json())
};

// Users
export const usersAPI = {
  getProfile: () =>
    authFetch(`${API_BASE_URL}/api/v1/users/me`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data?.message || 'Failed to fetch profile');
        }
        return data;
      }),

  updateProfile: (fullName, avatar) =>
    authFetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'PATCH',
      body: JSON.stringify({ fullName, avatar })
    }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        throw new Error(data?.message || 'Failed to update profile');
      }
      return data;
    }),

  getFavorites: (page = 1, limit = 20) =>
    authFetch(
      `${API_BASE_URL}/api/v1/users/me/favorites?page=${page}&limit=${limit}`
    ).then(r => r.json())
};

// Sync
export const syncAPI = {
  getManifest: () =>
    authFetch(`${API_BASE_URL}/api/v1/sync/manifest`)
      .then(r => r.json()),

  getFull: (version) =>
    authFetch(
      `${API_BASE_URL}/api/v1/sync/full${version ? `?version=${version}` : ''}`
    ).then(r => r.json()),

  getIncremental: (fromVersion) =>
    authFetch(`${API_BASE_URL}/api/v1/sync/incremental`, {
      method: 'POST',
      body: JSON.stringify({ fromVersion })
    }).then(r => r.json())
};

// Analytics
export const analyticsAPI = {
  submitEvents: (events) =>
    authFetch(`${API_BASE_URL}/api/v1/analytics/events`, {
      method: 'POST',
      body: JSON.stringify({ events })
    }).then(r => r.json()),

  sendHeartbeat: () =>
    authFetch(`${API_BASE_URL}/api/v1/analytics/presence/heartbeat`, {
      method: 'POST',
      body: JSON.stringify({
        deviceId: getDeviceId(),
        timestamp: Date.now()
      })
    }).then(r => r.json()),

  getStats: () =>
    authFetch(`${API_BASE_URL}/api/v1/analytics/stats`)
      .then(r => r.json())
};

// Export utilities
export function setAuthTokens(accessToken, refreshToken) {
  setTokens(accessToken, refreshToken);
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAuthToken() {
  return getAccessToken();
}
