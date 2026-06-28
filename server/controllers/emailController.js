const nodemailer = require('nodemailer');
const { Ticket } = require('../db');

// ── Hardcoded default keywords (used as seed if DB has none) ──────────────────
const DEFAULT_KEYWORDS = [
  { keyword: 'Printer Not Working',      category: 'Hardware',    emoji: '🖨️' },
  { keyword: 'Internet Slow / Down',     category: 'Network',     emoji: '🌐' },
  { keyword: 'AC Not Functioning',       category: 'Facilities',  emoji: '❄️' },
  { keyword: 'Power Fluctuation',        category: 'Electrical',  emoji: '⚡' },
  { keyword: 'Laptop / PC Issue',        category: 'Hardware',    emoji: '💻' },
  { keyword: 'Access / Login Denied',    category: 'Security',    emoji: '🔐' },
  { keyword: 'Software Not Opening',     category: 'Software',    emoji: '📦' },
  { keyword: 'Data Loss / File Missing', category: 'Data',        emoji: '📂' },
  { keyword: 'Projector Not Working',    category: 'Hardware',    emoji: '📽️' },
  { keyword: 'Phone / Extension Issue',  category: 'Telecom',     emoji: '📞' },
  { keyword: 'Slow System Performance',  category: 'Hardware',    emoji: '🐢' },
  { keyword: 'Email Not Receiving',      category: 'Software',    emoji: '📧' },
];

// In-memory keyword store (will be replaced per-request from DB if Supabase is up)
let runtimeKeywords = [...DEFAULT_KEYWORDS.map((k, i) => ({
  id: String(i + 1),
  ...k,
  isDefault: true,
  usageCount: 0,
  createdAt: new Date().toISOString(),
}))];

// ── Nodemailer transporter ────────────────────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── GET /api/complaint-keywords ───────────────────────────────────────────────
const getKeywords = async (req, res) => {
  try {
    const sorted = [...runtimeKeywords].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    res.json(sorted);
  } catch (err) {
    console.error('getKeywords error:', err);
    res.status(500).json({ message: 'Failed to fetch keywords' });
  }
};

// ── POST /api/complaint-keywords ──────────────────────────────────────────────
const addKeyword = async (req, res) => {
  try {
    const { keyword, category = 'Other' } = req.body;
    if (!keyword || keyword.trim().length < 3) {
      return res.status(400).json({ message: 'Keyword must be at least 3 characters' });
    }

    const trimmed = keyword.trim();

    const existing = runtimeKeywords.find(k =>
      k.keyword.toLowerCase().includes(trimmed.toLowerCase()) ||
      trimmed.toLowerCase().includes(k.keyword.toLowerCase())
    );

    if (existing) {
      existing.usageCount = (existing.usageCount || 0) + 1;
      return res.json({ message: 'Keyword already exists, usage incremented', keyword: existing });
    }

    const newKeyword = {
      id: String(Date.now()),
      keyword: trimmed,
      category,
      emoji: '📝',
      isDefault: false,
      usageCount: 1,
      createdAt: new Date().toISOString(),
    };

    runtimeKeywords.push(newKeyword);
    res.status(201).json({ message: 'Keyword added successfully', keyword: newKeyword });
  } catch (err) {
    console.error('addKeyword error:', err);
    res.status(500).json({ message: 'Failed to add keyword' });
  }
};

// ── POST /api/complaint-keywords/:id/increment ───────────────────────────────
const incrementKeyword = async (req, res) => {
  try {
    const { id } = req.params;
    const kw = runtimeKeywords.find(k => k.id === id);
    if (kw) {
      kw.usageCount = (kw.usageCount || 0) + 1;
      return res.json({ message: 'Usage incremented', keyword: kw });
    }
    res.status(404).json({ message: 'Keyword not found' });
  } catch (err) {
    console.error('incrementKeyword error:', err);
    res.status(500).json({ message: 'Failed to increment keyword' });
  }
};

// ── POST /api/generate-email ──────────────────────────────────────────────────
const generateEmail = async (req, res) => {
  try {
    const { complaintKeywords, customComplaint, recipientName, recipientRole, employeeName, employeeDepartment } = req.body;

    if ((!complaintKeywords || complaintKeywords.length === 0) && !customComplaint) {
      return res.status(400).json({ message: 'Please select at least one complaint keyword or describe your issue' });
    }

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
- Start with "Dear ${recipientName || 'Sir/Ma\'am'},"
- Keep it professional and respectful
- Be specific about the issue
- Request prompt action
- End with "Regards," followed by the employee name and department
- Do NOT add any explanation or preamble outside the email body
- Keep it under 200 words

Write only the email body:`;

    let generatedEmail = null;
    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3.2',
          prompt,
          stream: false,
        }),
      });

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json();
        generatedEmail = ollamaData.response?.trim();
      }
    } catch (ollamaErr) {
      console.error('Ollama local fetch failed:', ollamaErr.message);
    }

    if (!generatedEmail) {
      return res.status(502).json({ message: 'AI service unavailable. Please ensure your local Ollama instance (http://localhost:11434) is running.' });
    }

    res.json({ email: generatedEmail });
  } catch (err) {
    console.error('generateEmail error:', err);
    res.status(500).json({ message: 'Failed to generate email: ' + err.message });
  }
};

// ── POST /api/send-email ──────────────────────────────────────────────────────
const sendEmail = async (req, res) => {
  try {
    const { recipientEmail, recipientName, subject, emailBody, employeeName, employeeEmail, employeeDepartment } = req.body;

    if (!recipientEmail || !emailBody) {
      return res.status(400).json({ message: 'Recipient email and email body are required' });
    }

    const transporter = createTransporter();

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a3a6b, #2563eb); padding: 28px 32px; }
          .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { color: rgba(255,255,255,0.75); margin: 4px 0 0 0; font-size: 13px; }
          .badge { display: inline-block; background: #f97316; color: white; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-top: 10px; letter-spacing: 0.5px; }
          .body { padding: 32px; color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap; }
          .footer { background: #f8fafc; border-top: 1px solid #e5e7eb; padding: 16px 32px; font-size: 12px; color: #9ca3af; }
          .footer strong { color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏭 HindConnect — Complaint Notification</h1>
            <p>Hindalco Industries Limited · Internal Complaint System</p>
            <span class="badge">OFFICIAL COMMUNICATION</span>
          </div>
          <div class="body">${emailBody.replace(/\n/g, '<br/>')}</div>
          <div class="footer">
            <strong>Sent via HindConnect AI Email System</strong><br/>
            Employee: ${employeeName || 'N/A'} · Department: ${employeeDepartment || 'N/A'}<br/>
            This is an auto-generated email. Please do not reply directly to this message.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"HindConnect — ${employeeName || 'Employee'}" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      cc: employeeEmail || process.env.EMAIL_USER,
      subject: subject || `Complaint Notification from ${employeeDepartment || 'Employee'} Department`,
      text: emailBody,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    res.json({
      message: 'Email sent successfully!',
      messageId: info.messageId,
      sentTo: recipientEmail,
    });
  } catch (err) {
    console.error('sendEmail error:', err);
    res.status(500).json({ message: 'Failed to send email: ' + err.message });
  }
};

module.exports = { getKeywords, addKeyword, incrementKeyword, generateEmail, sendEmail };
