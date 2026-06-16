import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import AiAssistantPanel from '../components/AiAssistantPanel';
import { Landmark, ArrowLeft, Upload, Send, Cpu } from 'lucide-react';

export default function CreateTicketPage({ onNavigateSubpage }) {
  const { user, showAlert } = useAuth();
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(user?.department || 'Refinery');
  const [urgency, setUrgency] = useState('Medium');
  const [loading, setLoading] = useState(false);
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Debounce timeout ref
  const debounceTimeoutRef = useRef(null);

  // Trigger AI analysis as user types
  const triggerAiAnalysis = async (currentTitle, currentDesc) => {
    if (!currentTitle.trim()) {
      setAiSuggestions(null);
      return;
    }
    
    try {
      setAiLoading(true);
      const suggestions = await api.analyzeTicket(currentTitle, currentDesc);
      setAiSuggestions(suggestions);
      
      // Auto-populate predicted fields if appropriate, but let the user override
      if (suggestions.priority) {
        setUrgency(suggestions.priority);
      }
    } catch (err) {
      console.warn('AI Analysis failed:', err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);

    // Debounce AI analyze request
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      triggerAiAnalysis(val, description);
    }, 60000); // 600ms debounce delay
  };

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      triggerAiAnalysis(title, val);
    }, 600);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
        category: aiSuggestions?.predictedCategory || 'Software',
        attachments: []
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
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">Raise IT Incident</h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">Submit an issue for review by our engineering standby team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Form Container */}
        <div className="bg-white border border-corporate-grayBorder rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Upload Mock */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Attachments (Log files, Screenshots)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-corporate-blue/40 rounded-xl p-4 text-center cursor-pointer transition-colors">
                <Upload className="w-5 h-5 mx-auto text-slate-400" />
                <span className="text-[11px] text-slate-500 font-semibold block mt-1.5">Drag files or browse local disk</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">JPEG, PNG, LOG formats up to 10MB</span>
              </div>
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

        {/* AI Assistant suggestions */}
        <div className="lg:col-span-5">
          <AiAssistantPanel loading={aiLoading} suggestions={aiSuggestions} />
        </div>

      </div>
    </div>
  );
}
