import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur : injection automatique du token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('desksuite_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : gestion globale des erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('desksuite_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    workspace_name: string;
    subdomain: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  switchTenant: (tenant_id: string) =>
    api.post('/auth/switch-tenant', { tenant_id }),
};

// ─── Drive ──────────────────────────────────────────────────────────────
export const driveApi = {
  list: (folder_id?: string | null, trashed = false) =>
    api.get('/drive', { params: { folder_id, trashed } }),

  createFolder: (name: string, parent_id?: string | null) =>
    api.post('/drive/folders', { name, parent_id }),

  upload: (file: File, folder_id?: string | null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder_id) formData.append('folder_id', folder_id);
    return api.post('/drive/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  ocr: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/drive/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  download: (fileId: string) => api.get(`/drive/files/${fileId}/download`),

  trash: (fileId: string) => api.post(`/drive/files/${fileId}/trash`),

  restore: (fileId: string) => api.post(`/drive/files/${fileId}/restore`),

  delete: (fileId: string) => api.delete(`/drive/files/${fileId}`),
};

// ─── Documents ──────────────────────────────────────────────────────────
export const documentsApi = {
  list: (type?: string) =>
    api.get('/documents', { params: { type } }),

  get: (id: string) => api.get(`/documents/${id}`),

  create: (data: { type: string; name: string; content?: unknown }) =>
    api.post('/documents', data),

  update: (id: string, data: { name?: string; content?: unknown }) =>
    api.put(`/documents/${id}`, data),

  delete: (id: string) => api.delete(`/documents/${id}`),
};

// ─── Forms ──────────────────────────────────────────────────────────────
export const formsApi = {
  list: () => api.get('/forms'),

  get: (id: string) => api.get(`/forms/${id}`),

  create: (data: { title: string; schema: unknown[] }) =>
    api.post('/forms', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/forms/${id}`, data),

  submit: (formId: string, data: Record<string, unknown>) =>
    api.post(`/forms/${formId}/submit`, { data }),

  delete: (id: string) => api.delete(`/forms/${id}`),
};

// ─── Backups ────────────────────────────────────────────────────────────
export const backupApi = {
  list: () => api.get('/backups'),
  runDb: () => api.post('/backups/db'),
  runFiles: () => api.post('/backups/files'),
};
// ─── Admin & Watchdog ──────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/analytics/stats'),
};
