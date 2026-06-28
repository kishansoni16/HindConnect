import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Mail, Zap, Send, Plus, X, Loader2, CheckCircle,
  AlertCircle, ChevronDown, RefreshCw, Sparkles, Tag, Paperclip
} from 'lucide-react';

// ── Recipient directory by department ────────────────────────────────────────
const RECIPIENT_DIRECTORY = [
  { label: 'IT Department Head',        email: 'jalakerakh@gmail.com',          department: 'IT' },
  { label: 'HR Department Head',        email: 'hr.head@hindalco.com',          department: 'HR' },
  { label: 'Maintenance Incharge',      email: 'maintenance@hindalco.com',      department: 'Maintenance' },
  { label: 'Plant Manager',             email: 'plantmanager@hindalco.com',     department: 'Operations' },
  { label: 'Facilities Manager',        email: 'facilities@hindalco.com',       department: 'Facilities' },
  { label: 'Safety Officer',            email: 'safety@hindalco.com',           department: 'Safety' },
  { label: 'Finance Head',              email: 'finance.head@hindalco.com',     department: 'Finance' },
  { label: 'Logistics Incharge',        email: 'logistics@hindalco.com',        department: 'Logistics' },
  { label: 'Smelter Incharge',          email: 'smelter@hindalco.com',          department: 'Smelter' },
  { label: 'Refinery Incharge',         email: 'refinery@hindalco.com',         department: 'Refinery' },
];

// ── Step indicator ────────────────────────────────────────────────────────────
const StepBadge = ({ step, current, label }) => {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all
        ${done   ? 'bg-emerald-500 border-emerald-500 text-white'
        : active ? 'bg-corporate-orange border-corporate-orange text-white shadow-md'
                 : 'bg-white border-slate-300 text-slate-400'}`}>
        {done ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className={`text-xs font-bold hidden sm:block transition-all
        ${active ? 'text-corporate-orange' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
};

// ── Keyword chip ──────────────────────────────────────────────────────────────
const KeywordChip = ({ kw, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(kw)}
    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer select-none
      ${selected
        ? 'bg-corporate-orange text-white border-corporate-orange shadow-md scale-105'
        : 'bg-white text-slate-600 border-slate-200 hover:border-corporate-orange hover:text-corporate-orange hover:shadow-sm'
      }`}
  >
    <span>{kw.emoji || '📝'}</span>
    <span>{kw.keyword}</span>
    {selected && <X className="w-3 h-3" />}
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIEmailPage() {
  const { user } = useAuth();

  // Step: 1 = pick complaint, 2 = pick recipient, 3 = preview email, 4 = sent
  const [step, setStep] = useState(1);

  // Keyword state
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(true);
  const [customComplaint, setCustomComplaint] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Recipient state
  const [recipient, setRecipient] = useState(null);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);

  // Email generation state
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Send state
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(null);

  // Attachments state
  const [attachments, setAttachments] = useState([]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let currentTotalSize = attachments.reduce((sum, f) => sum + f.size, 0);
    const maxSize = 20 * 1024 * 1024; // 20MB

    const newAttachments = [];
    setSendError('');

    for (const file of files) {
      if (currentTotalSize + file.size > maxSize) {
        setSendError('Total attachments size cannot exceed 20MB.');
        break;
      }
      try {
        const base64Data = await fileToBase64(file);
        const base64Content = base64Data.split(',')[1];
        newAttachments.push({
          filename: file.name,
          content: base64Content,
          contentType: file.type,
          size: file.size
        });
        currentTotalSize += file.size;
      } catch (err) {
        console.error('Failed to read file:', err);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // ── Load keywords on mount ─────────────────────────────────────────────────
  const loadKeywords = useCallback(async () => {
    setLoadingKeywords(true);
    try {
      const data = await api.getComplaintKeywords();
      setKeywords(data);
    } catch {
      // Fallback: show nothing, the backend seeds defaults
    } finally {
      setLoadingKeywords(false);
    }
  }, []);

  useEffect(() => { loadKeywords(); }, [loadKeywords]);

  // ── Keyword chip toggle ────────────────────────────────────────────────────
  const toggleKeyword = (kw) => {
    setSelectedKeywords(prev =>
      prev.find(k => k.id === kw.id)
        ? prev.filter(k => k.id !== kw.id)
        : [...prev, kw]
    );
    api.incrementKeyword(kw.id).catch(() => {});
  };

  // ── Add custom complaint ───────────────────────────────────────────────────
  const handleAddCustomComplaint = async () => {
    if (!customComplaint.trim() || customComplaint.trim().length < 3) return;
    try {
      const res = await api.addComplaintKeyword(customComplaint.trim());
      await loadKeywords();
      if (res.keyword) {
        setSelectedKeywords(prev =>
          prev.find(k => k.id === res.keyword.id) ? prev : [...prev, res.keyword]
        );
      }
      setCustomComplaint('');
      setShowCustomInput(false);
    } catch {
      // fallback
    }
  };

  // ── Generate email via Ollama ──────────────────────────────────────────────
  const handleGenerateEmail = async () => {
    setGenerating(true);
    setGenerateError('');
    try {
      const recipientName = useCustomRecipient
        ? 'Department Head'
        : recipient?.label || 'Department Head';
      const recipientRole = useCustomRecipient
        ? 'Incharge'
        : recipient?.department + ' Head' || 'Incharge';

      const res = await api.generateEmail({
        complaintKeywords: selectedKeywords.map(k => k.keyword),
        customComplaint: customComplaint.trim() || undefined,
        recipientName,
        recipientRole,
        employeeName: user?.name || 'Employee',
        employeeDepartment: user?.department || 'Operations',
      });

      setGeneratedEmail(res.email);
      setEditedEmail(res.email);
      setStep(3);
    } catch (err) {
      setGenerateError(err.message || 'Failed to generate email. Is Ollama running?');
    } finally {
      setGenerating(false);
    }
  };

  // ── Send email ─────────────────────────────────────────────────────────────
  const handleSendEmail = async () => {
    setSending(true);
    setSendError('');
    try {
      const toEmail = useCustomRecipient ? customRecipientEmail : recipient?.email;
      const toName   = useCustomRecipient ? 'Department Head' : recipient?.label;

      const res = await api.sendComplaintEmail({
        recipientEmail: toEmail,
        recipientName: toName,
        subject: `Complaint from ${user?.department || 'Employee'} Department — ${selectedKeywords.map(k=>k.keyword).join(', ') || 'General Issue'}`,
        emailBody: editedEmail,
        employeeName: user?.name,
        employeeEmail: user?.email,
        employeeDepartment: user?.department,
        attachments,
      });

      setSendSuccess(res);
      setStep(4);
    } catch (err) {
      setSendError(err.message || 'Failed to send email. Check SMTP settings.');
    } finally {
      setSending(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setSelectedKeywords([]);
    setCustomComplaint('');
    setShowCustomInput(false);
    setRecipient(null);
    setCustomRecipientEmail('');
    setUseCustomRecipient(false);
    setGeneratedEmail('');
    setEditedEmail('');
    setGenerateError('');
    setSendError('');
    setSendSuccess(null);
    setAttachments([]);
  };

  const canProceedStep1 = selectedKeywords.length > 0 || customComplaint.trim().length >= 3;
  const canProceedStep2 = useCustomRecipient
    ? customRecipientEmail.includes('@')
    : !!recipient;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-corporate-orange" />
            AI Email Complaint
          </h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">
            Select your issue, pick a recipient — our AI drafts a professional email in seconds.
          </p>
        </div>
        {step > 1 && step < 4 && (
          <button onClick={resetAll} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Start over
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 bg-white border border-corporate-grayBorder rounded-xl px-5 py-3 shadow-sm">
        <StepBadge step={1} current={step} label="Pick Issue" />
        <div className="flex-1 h-px bg-slate-200" />
        <StepBadge step={2} current={step} label="Pick Recipient" />
        <div className="flex-1 h-px bg-slate-200" />
        <StepBadge step={3} current={step} label="Review Email" />
        <div className="flex-1 h-px bg-slate-200" />
        <StepBadge step={4} current={step} label="Sent!" />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-corporate-blue to-corporate-blueLight px-6 py-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-corporate-orange" />
              Step 1 — Select Your Complaint(s)
            </h3>
            <p className="text-white/70 text-xs mt-0.5">Click one or more complaint chips. You can select multiple.</p>
          </div>

          <div className="p-6 space-y-5">
            {loadingKeywords ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-7 h-7 text-corporate-orange animate-spin" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {keywords.map(kw => (
                  <KeywordChip
                    key={kw.id}
                    kw={kw}
                    selected={!!selectedKeywords.find(k => k.id === kw.id)}
                    onClick={toggleKeyword}
                  />
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-corporate-orange hover:text-corporate-orangeHover border border-dashed border-corporate-orange/40 hover:border-corporate-orange px-4 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Describe a different issue (Other)
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Describe your issue:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customComplaint}
                      onChange={e => setCustomComplaint(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCustomComplaint()}
                      placeholder="e.g. Water leaking from ceiling in server room..."
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-corporate-orange/30 focus:border-corporate-orange"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomComplaint}
                      disabled={customComplaint.trim().length < 3}
                      className="px-4 py-2 bg-corporate-orange text-white text-xs font-bold rounded-lg hover:bg-corporate-orangeHover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCustomInput(false); setCustomComplaint(''); }}
                      className="px-3 py-2 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Press Enter or click Add — your complaint will be saved to the list for others too!</p>
                </div>
              )}
            </div>

            {(selectedKeywords.length > 0 || customComplaint.trim()) && (
              <div className="bg-corporate-orange/5 border border-corporate-orange/20 rounded-xl p-3">
                <p className="text-xs font-bold text-corporate-orange mb-1.5">Selected Issues:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedKeywords.map(k => (
                    <span key={k.id} className="text-xs bg-corporate-orange text-white px-2.5 py-1 rounded-full font-semibold">
                      {k.emoji} {k.keyword}
                    </span>
                  ))}
                  {customComplaint.trim() && (
                    <span className="text-xs bg-slate-700 text-white px-2.5 py-1 rounded-full font-semibold">
                      📝 {customComplaint.trim()}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-3 bg-corporate-orange text-white text-sm font-extrabold rounded-xl hover:bg-corporate-orangeHover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Continue → Choose Recipient
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-corporate-blue to-corporate-blueLight px-6 py-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-corporate-orange" />
              Step 2 — Who should receive this complaint?
            </h3>
            <p className="text-white/70 text-xs mt-0.5">Select a department head or enter a custom email.</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RECIPIENT_DIRECTORY.map(r => (
                <button
                  key={r.email}
                  type="button"
                  onClick={() => { setRecipient(r); setUseCustomRecipient(false); }}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer
                    ${recipient?.email === r.email && !useCustomRecipient
                      ? 'border-corporate-orange bg-corporate-orange/5'
                      : 'border-slate-200 hover:border-corporate-orange/50 hover:bg-slate-50'
                    }`}
                >
                  <p className="text-sm font-bold text-slate-700">{r.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.email}</p>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide mt-1 inline-block">
                    {r.department}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => { setUseCustomRecipient(!useCustomRecipient); setRecipient(null); }}
                className={`inline-flex items-center gap-2 text-xs font-bold border border-dashed px-4 py-2.5 rounded-full transition-all cursor-pointer
                  ${useCustomRecipient
                    ? 'border-corporate-orange text-corporate-orange bg-corporate-orange/5'
                    : 'border-slate-300 text-slate-500 hover:border-corporate-orange hover:text-corporate-orange'
                  }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Send to a custom email address
              </button>
              {useCustomRecipient && (
                <input
                  type="email"
                  value={customRecipientEmail}
                  onChange={e => setCustomRecipientEmail(e.target.value)}
                  placeholder="e.g. manager@hindalco.com"
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-corporate-orange/30 focus:border-corporate-orange"
                  autoFocus
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleGenerateEmail}
                disabled={!canProceedStep2 || generating}
                className="flex-1 py-3 bg-corporate-orange text-white text-sm font-extrabold rounded-xl hover:bg-corporate-orangeHover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI is writing your email…
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Email with AI
                  </>
                )}
              </button>
            </div>

            {generateError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generateError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Step 3 — Review & Send Your Email
            </h3>
            <p className="text-white/70 text-xs mt-0.5">
              AI has drafted your email. You can edit it before sending.
              → {useCustomRecipient ? customRecipientEmail : recipient?.label} ({useCustomRecipient ? 'Custom' : recipient?.email})
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Email Body</label>
              <textarea
                value={editedEmail}
                onChange={e => setEditedEmail(e.target.value)}
                rows={14}
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 font-mono leading-relaxed resize-none"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  Attachments (Optional, Max 20MB total)
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-corporate-orange hover:text-corporate-orange hover:bg-slate-50 transition-all select-none">
                  <Plus className="w-3.5 h-3.5" />
                  Add Files
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-sm">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{att.filename}</span>
                        <span className="text-[10px] text-slate-400">({(att.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-slate-400 hover:text-red-500 transition-all cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                    <span>Total: {attachments.length} file(s)</span>
                    <span>
                      Total Size: {(attachments.reduce((acc, curr) => acc + curr.size, 0) / 1024 / 1024).toFixed(2)} MB / 20.00 MB
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => handleGenerateEmail()}
                disabled={generating}
                className="px-5 py-3 border border-corporate-orange text-corporate-orange text-sm font-bold rounded-xl hover:bg-corporate-orange/5 cursor-pointer transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending || !editedEmail.trim()}
                className="flex-1 py-3 bg-emerald-600 text-white text-sm font-extrabold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Email Now</>
                )}
              </button>
            </div>

            {sendError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{sendError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">Email Sent Successfully! 🎉</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your complaint has been professionally delivered to{' '}
                <span className="font-bold text-slate-700">
                  {useCustomRecipient ? customRecipientEmail : recipient?.label}
                </span>.
              </p>
              <p className="text-xs text-slate-400 mt-1">A copy has also been sent to your email address.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-left w-full max-w-sm space-y-1.5">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Delivery Summary</p>
              <p className="text-sm text-slate-700">📨 Message ID: <span className="font-mono text-xs text-slate-500">{sendSuccess?.messageId || 'N/A'}</span></p>
              <p className="text-sm text-slate-700">📬 Sent To: <span className="font-semibold">{useCustomRecipient ? customRecipientEmail : recipient?.email}</span></p>
              <p className="text-sm text-slate-700">🧑 From: <span className="font-semibold">{user?.name} ({user?.department})</span></p>
            </div>

            <button
              type="button"
              onClick={resetAll}
              className="px-8 py-3 bg-corporate-orange text-white text-sm font-extrabold rounded-xl hover:bg-corporate-orangeHover cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              + Send Another Complaint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
