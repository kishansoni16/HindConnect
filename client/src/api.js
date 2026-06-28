const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

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

  getRecipients: () => fetch(`${API_BASE_URL}/users/recipients`, {
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

  chat: async (message, history = []) => {
    const systemInstructionText = `
You are the HindConnect IT Assistant, an advanced virtual agent dedicated to helping employees of Hindalco plants (refineries like Refinery, smelters like Smelter, logistics, finance, IT departments) with technical support and IT queries.

Follow these corporate rules and technical specifications strictly:
1. VPN Access: Use GlobalProtect VPN client portal address "vpn.hindalco.com". It requires an active HindConnect Active Directory (AD) login and Multi-Factor Authentication (MFA) approved on a registered mobile device.
2. Network Printers: Printers are HP/Ricoh. Map your badge on first swipe by tapping "Yes" and entering AD credentials. Windows print queue path is "\\\\prnt-srv-corp\\HindPrint-Secure".
3. Active Directory Password Reset: AD Self-Service Password Reset (SSPR) portal is "https://identity.hindalco.com". Passwords expire every 90 days. Minimum length is 12 characters with uppercase, numbers, and symbols.
4. SAP S/4HANA ERP Access: Access is requested via GRC Portal "https://grc.hindalco.com" using AD credentials. Transaction codes like ME21N (Purchase Orders) or FB01 (Accounting) must have business justification and manager approval.
5. SLA Guidelines: Critical incidents (4 hours resolution), High (24 hours), Medium (48 hours), Low (72 hours).
6. Incidents: If user wants to check/track/submit tickets, tell them to log in to HindConnect portal and access the ticket dashboard.
7. Multilingual Support: If the user asks their question in Hindi (either in Hindi script like "पासवर्ड कैसे रीसेट करें?" or transliterated Hinglish like "password reset kaise kare"), or asks you to answer in Hindi, you MUST respond entirely in Hindi. Keep the Hindi response natural, polite, and clear, using standard English terms for technical jargon (like VPN, Active Directory, SAP, printer, etc.) where helpful.

Tone: Professional, direct, helpful, and concise. Format your responses with clean Markdown (bullet points, bold text). Keep responses to 2-3 paragraphs max so they fit comfortably in a chat window.
`;

    const formattedHistory = history.map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
    const prompt = `${systemInstructionText}\n\nChat History:\n${formattedHistory}\n\nUser: ${message}\nAssistant:`;

    // Attempt direct local connection to local Ollama from client's browser
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt,
          stream: false,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return { text: data.response?.trim() || "I'm sorry, I couldn't process your request." };
      }
    } catch (err) {
      console.warn('Client-side local Ollama fetch failed, calling backend fallback...', err.message);
    }

    return fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history }),
    }).then(handleResponse);
  },

  // AI Email Complaint
  getComplaintKeywords: () => fetch(`${API_BASE_URL}/complaint-keywords`, {
    method: 'GET',
    headers: getHeaders(),
  }).then(handleResponse),

  addComplaintKeyword: (keyword, category) => fetch(`${API_BASE_URL}/complaint-keywords`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ keyword, category }),
  }).then(handleResponse),

  incrementKeyword: (id) => fetch(`${API_BASE_URL}/complaint-keywords/${id}/increment`, {
    method: 'POST',
    headers: getHeaders(),
  }).then(handleResponse),

  generateEmail: async (data) => {
    const { complaintKeywords, customComplaint, recipientName, recipientRole, employeeName, employeeDepartment } = data;
    
    const issueList = [
      ...(complaintKeywords || []),
      ...(customComplaint ? [customComplaint] : []),
    ].join(', ');

    const prompt = `You are a professional corporate email assistant for Hindalco Industries, an aluminium manufacturing company in India.

Write a formal, polite, and concise complaint/request email based on the following:

Employee Name: ${employeeName || 'An Employee'}
Employee Department: ${employeeDepartment || 'Operations'}
Recipient: ${recipientName || 'Department Incharge'}
Recipient Role: ${recipientRole || 'Department Head'}
Issues/Complaints: ${issueList}

Requirements:
- Start with "Respected Sir/Ma'am," or "Respected ${recipientName},"
- Write in a respectful, highly formal, and professional corporate tone using simple, clear English.
- Avoid robotic, complex, or overly stiff template language.
- Keep the email body very short, direct, and strictly to the point.
- Request necessary action using a direct, highly formal, and polite corporate statement (e.g., "I request you to kindly arrange for its repair or resolution at your earliest convenience...") instead of asking casual questions.
- End with "Regards," followed by the employee name and department.
- Do NOT add any subject line, headers, explanation, or preamble outside the email body.
- Keep the entire body under 100 words.

Write only the email body:`;

    // Attempt direct local connection to local Ollama from client's browser
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt,
          stream: false,
        }),
      });
      if (response.ok) {
        const resData = await response.json();
        return { email: resData.response?.trim() };
      }
    } catch (err) {
      console.warn('Client-side local Ollama email generate failed, calling backend fallback...', err.message);
    }

    return fetch(`${API_BASE_URL}/generate-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse);
  },

  sendComplaintEmail: (data) => fetch(`${API_BASE_URL}/send-email`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse)
};

export default api;

