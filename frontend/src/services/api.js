// All frontend-to-backend communication lives in this file.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

function buildQuery(parameters = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function request(path, options = {}) {
  let response;

  const token = localStorage.getItem('grainex_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (_error) {
    throw new Error(
      'Cannot connect to the backend. Check that Flask is running on port 5000.',
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}.`);
  }

  return payload;
}

const jsonBody = (data) => ({ body: JSON.stringify(data) });

export const api = {
  health: () => request('/health'),

  // Auth & Tenant Endpoints
  login: (data) => request('/auth/login', { method: 'POST', ...jsonBody(data) }),
  register: (data) => request('/auth/register', { method: 'POST', ...jsonBody(data) }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', ...jsonBody(data) }),
  submitContactForm: (data) => request('/auth/contact', { method: 'POST', ...jsonBody(data) }),
  getProfile: () => request('/auth/me'),

  // Store Management Dashboard
  getDashboardSummary: () => request('/dashboard-summary'),

  getProducts: (filters = {}) => request(`/products${buildQuery(filters)}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', ...jsonBody(data) }),
  updateProduct: (id, data) =>
    request(`/products/${id}`, { method: 'PUT', ...jsonBody(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', ...jsonBody(data) }),
  updateCategory: (id, data) =>
    request(`/categories/${id}`, { method: 'PUT', ...jsonBody(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getSales: (filters = {}) => request(`/sales${buildQuery(filters)}`),
  createSale: (data) => request('/sales', { method: 'POST', ...jsonBody(data) }),

  getSalesReport: (filters = {}) => request(`/reports/sales${buildQuery(filters)}`),

  // Super Admin Endpoints
  getAdminStats: () => request('/admin/stats'),
  getAdminStores: (search = '') =>
    request(`/admin/stores${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateStoreStatus: (id, status) =>
    request(`/admin/stores/${id}/status`, { method: 'POST', ...jsonBody({ status }) }),
  deleteStore: (id) => request(`/admin/stores/${id}`, { method: 'DELETE' }),
};

export { API_BASE_URL };
