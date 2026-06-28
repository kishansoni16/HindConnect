import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Landmark, ArrowLeft, Upload, Send, Cpu, X } from 'lucide-react';

export default function CreateTicketPage({ onNavigateSubpage }) {
  const { user, showAlert } = useAuth();
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Refinery');
  const [urgency, setUrgency] = useState('Medium');
  const [recipientId, setRecipientId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [useCustomRecipient, setUseCustomRecipient] = useState(false);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const data = await api.getRecipients();
        // filter out current user
        const filtered = data.filter(u => u.id !== user?.id && u._id !== user?.id && u.id !== user?._id && u._id !== user?._id);
        setRecipients(filtered);
      } catch (err) {
        console.error('Failed to load recipients:', err);
      }
    };
    fetchRecipients();
  }, [user]);
  
  // Attachments State
  const [attachments, setAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    files.forEach(file => {
      if (file.size > 20 * 1024 * 1024) {
        showAlert(`File ${file.name} exceeds 20MB limit`, 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            data: reader.result
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showAlert('Please fill in both the issue title and description', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        title,
        description,
        department,
        priority: urgency,
        category: 'Software',
        attachments: attachments,
        recipientId: useCustomRecipient ? customRecipientEmail : (recipientId || null),
        recipientName: useCustomRecipient ? customRecipientName : (recipientName || null)
      };

      await api.createTicket(payload);
      showAlert('Support incident raised successfully. IT desks notified.', 'success');
      onNavigateSubpage('dashboard_home');
    } catch (err) {
      showAlert('Failed to create ticket: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Refinery', 'Smelter', 'Corporate', 'Logistics', 'Finance', 'IT'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigateSubpage('dashboard_home')}
          className="p-1.5 text-corporate-textMuted hover:text-corporate-blue hover:bg-slate-100 rounded-lg transition-colors border border-corporate-grayBorder bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">Raise Ticket</h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">Submit an issue for review by our engineering standby team.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Form Container */}
        <div className="bg-white border border-corporate-grayBorder rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Recipient Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="ticket-recipient" className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Assign/Send Ticket To (Recipient)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomRecipient(!useCustomRecipient);
                    setRecipientId('');
                    setRecipientName('');
                    setCustomRecipientEmail('');
                    setCustomRecipientName('');
                  }}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold border border-dashed px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    useCustomRecipient
                      ? 'border-corporate-orange text-corporate-orange bg-corporate-orange/5'
                      : 'border-slate-300 text-slate-500 hover:border-corporate-orange hover:text-corporate-orange'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {useCustomRecipient ? 'Select registered user instead' : 'Enter custom name/email'}
                </button>
              </div>

              {!useCustomRecipient ? (
                <select
                  id="ticket-recipient"
                  value={recipientId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecipientId(val);
                    const selected = recipients.find(r => r.id === val);
                    setRecipientName(selected ? selected.name : '');
                  }}
                  className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white font-semibold"
                >
                  <option value="">Default (IT Standby Support / Unassigned)</option>
                  {recipients.map((r) => (
                    <option key={r.id || r._id} value={r.id || r._id}>
                      {r.name} ({r.role} - {r.department})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Name (e.g. Safety Officer)"
                    value={customRecipientName}
                    onChange={(e) => setCustomRecipientName(e.target.value)}
                    className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white font-semibold"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Recipient Email (e.g. safety@hindalco.com)"
                    value={customRecipientEmail}
                    onChange={(e) => setCustomRecipientEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white font-semibold"
                  />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-title" className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Issue Summary / Title
              </label>
              <input
                id="ticket-title"
                type="text"
                required
                placeholder="Briefly state the incident (e.g. Printer offline in Smelter, VPN connection loop)"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none"
              />
            </div>

            {/* Department & Urgency Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="ticket-dept" className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Affected Department
                </label>
                <select
                  id="ticket-dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="ticket-urgency" className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                  Urgency / Priority
                </label>
                <select
                  id="ticket-urgency"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white"
                >
                  <option value="Low">Low (No operations impact)</option>
                  <option value="Medium">Medium (Partial disruption)</option>
                  <option value="High">High (Single site blockage)</option>
                  <option value="Critical">Critical (Operations halted / VIP lockout)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="ticket-desc" className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Detailed Incident Logs
              </label>
              <textarea
                id="ticket-desc"
                rows="6"
                required
                placeholder="Describe what occurred, any error messages, and what steps you have already attempted. Mention your computer's asset ID if applicable."
                value={description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-3 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none resize-none"
              ></textarea>
            </div>

            {/* Upload Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Attachments (Log files, Screenshots)
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.log,text/plain,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-corporate-orange bg-corporate-orange/5' 
                    : 'border-slate-200 hover:border-corporate-blue/40'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400" />
                <span className="text-[11px] text-slate-500 font-semibold block mt-1.5">
                  {dragActive ? 'Drop files here' : 'Drag files or browse local disk'}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">JPEG, PNG, LOG, TXT formats up to 20MB</span>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Attached Files ({attachments.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <span className="truncate font-medium text-slate-700 max-w-[160px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="text-red-500 hover:text-red-700 p-0.5 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                By submitting, you agree to IT usage terms. Critical requests are reviewed under 4-hour SLA timeline.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="bg-corporate-blue hover:bg-corporate-blueLight text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all duration-200 shadow-md flex items-center space-x-2 border border-transparent"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Submit Incident</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
