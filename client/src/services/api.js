const TOKEN_KEY = 'skillforge_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError('Could not reach the SkillForge server. Is it running?', 0, {});
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      setToken(null);
    }
    throw new ApiError(data?.error || `Request failed with status ${res.status}`, res.status, data?.fields);
  }

  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  // profile
  getProfile: () => request('/profile'),
  updateProfile: (payload) => request('/profile', { method: 'PUT', body: payload }),
  resetProfileData: () => request('/profile/reset', { method: 'POST' }),

  // dashboard
  getDashboard: () => request('/dashboard'),

  // roles
  listRoles: (params = {}) => request(`/roles${toQuery(params)}`),
  getRole: (id) => request(`/roles/${id}`),
  listCategories: () => request('/roles/categories'),

  // skills
  listSkills: (params = {}) => request(`/skills${toQuery(params)}`),
  createSkill: (payload) => request('/skills', { method: 'POST', body: payload }),
  updateSkill: (id, payload) => request(`/skills/${id}`, { method: 'PUT', body: payload }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  // analysis
  getAnalysis: (roleId) => request(`/analysis/${roleId}`),

  // roadmaps
  listRoadmaps: () => request('/roadmaps'),
  createRoadmap: (payload) => request('/roadmaps', { method: 'POST', body: payload }),
  updateRoadmap: (id, payload) => request(`/roadmaps/${id}`, { method: 'PUT', body: payload }),
  getRoadmapItems: (id) => request(`/roadmaps/${id}/items`),
  addRoadmapItem: (id, payload) => request(`/roadmaps/${id}/items`, { method: 'POST', body: payload }),
  reorderRoadmapItems: (id, order) => request(`/roadmaps/${id}/reorder`, { method: 'PUT', body: { order } }),
  updateRoadmapItem: (itemId, payload) => request(`/roadmap-items/${itemId}`, { method: 'PUT', body: payload }),
  deleteRoadmapItem: (itemId) => request(`/roadmap-items/${itemId}`, { method: 'DELETE' }),

  // projects
  listProjects: (params = {}) => request(`/projects${toQuery(params)}`),
  getRecommendedProjects: (roleId) => request(`/projects/recommended/${roleId}`),
};

function toQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  const qs = new URLSearchParams(entries);
  return `?${qs.toString()}`;
}

export { ApiError };
