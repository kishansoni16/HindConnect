const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('hindconnect_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Auth
  login: (email, password) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  }).then(handleResponse),

  register: (name, email, password, role, department, profileDetails = {}) => fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password, role, department, ...profileDetails }),
  }).then(handleResponse),

  sendOtp: (email) => fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  }).then(handleResponse),

  verifyOtp: (email, otp) => fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, otp }),
  }).then(handleResponse),

  getMe: () => fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  // Tickets
  getTickets: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    return fetch(`${API_BASE_URL}/tickets?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getTicketById: (id) => fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  createTicket: (ticketData) => fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(ticketData),
  }).then(handleResponse),

  updateTicket: (id, updates) => fetch(`${API_BASE_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  }).then(handleResponse),

  addComment: (ticketId, message, isInternal = false) => fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, isInternal }),
  }).then(handleResponse),

  // Knowledge Base
  getKbArticles: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);

    return fetch(`${API_BASE_URL}/kb?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    }).then(handleResponse);
  },

  getKbArticleById: (id) => fetch(`${API_BASE_URL}/kb/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  voteHelpful: (id) => fetch(`${API_BASE_URL}/kb/${id}/helpful`, {
    method: 'PUT',
    headers: getHeaders(),
  }).then(handleResponse),

  // AI assistant analyzer
  analyzeTicket: (title, description) => fetch(`${API_BASE_URL}/ai/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, description }),
  }).then(handleResponse),

  // Analytics
  getAnalytics: () => fetch(`${API_BASE_URL}/analytics`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  readAllNotifications: () => fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: getHeaders(),
  }).then(handleResponse),

  // IT Staff
  getItStaff: () => fetch(`${API_BASE_URL}/users/staff`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  // Admin User Management
  updateProfile: (profileData) => fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  }).then(handleResponse),

  getUsers: () => fetch(`${API_BASE_URL}/users`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  approveUser: (id) => fetch(`${API_BASE_URL}/users/${id}/approve`, {
    method: 'PUT',
    headers: getHeaders(),
  }).then(handleResponse),

  chat: (message, history = []) => fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, history }),
  }).then(handleResponse)
};

