import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  User, 
  Filter, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function ItStaffDashboard() {
  const { user, showAlert } = useAuth();
  
  // States
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer action fields
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      
      // Load all tickets (IT Staff can view all queues)
      const data = await api.getTickets({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery
      });
      setTickets(data);

      // Load IT Staff list for reassignment dropdowns
      const staff = await api.getItStaff();
      setStaffList(staff);
    } catch (err) {
      showAlert('Failed to load queue: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTickets();
  };

  const handleTicketClick = async (ticket) => {
    try {
      const detail = await api.getTicketById(ticket.id || ticket._id);
      setSelectedTicket(detail);
    } catch (err) {
      showAlert('Failed to retrieve incident: ' + err.message, 'error');
    }
  };

  // Modify incident status
  const handleUpdateStatus = async (status) => {
    if (!selectedTicket) return;
    try {
      setActionLoading(true);
      const id = selectedTicket.ticket.id || selectedTicket.ticket._id;
      await api.updateTicket(id, { status });
      
      const refreshed = await api.getTicketById(id);
      setSelectedTicket(refreshed);
      loadTickets();
      showAlert(`Ticket status set to ${status}`, 'success');
    } catch (err) {
      showAlert('Status update failed: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign incident to person
  const handleAssignTo = async (assigneeId) => {
    if (!selectedTicket) return;
    try {
      setActionLoading(true);
      const id = selectedTicket.ticket.id || selectedTicket.ticket._id;
      await api.updateTicket(id, { assignedTo: assigneeId || null });
      
      const refreshed = await api.getTicketById(id);
      setSelectedTicket(refreshed);
      loadTickets();
      showAlert(assigneeId ? 'Ticket reassigned successfully' : 'Assignment cleared', 'success');
    } catch (err) {
      showAlert('Reassignment failed: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Add notes
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setActionLoading(true);
      const id = selectedTicket.ticket.id || selectedTicket.ticket._id;
      await api.addComment(id, commentText, isInternalComment);
      
      const refreshed = await api.getTicketById(id);
      setSelectedTicket(refreshed);
      setCommentText('');
      setIsInternalComment(false);
      showAlert('Note added successfully', 'success');
    } catch (err) {
      showAlert('Failed to post note: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isSlaBreached = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') return false;
    if (!ticket.slaDeadline) return false;
    return new Date(ticket.slaDeadline) < new Date();
  };

  const getSlaTimeRemaining = (ticket) => {
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') return 'Resolved';
    if (!ticket.slaDeadline) return 'N/A';
    
    const diff = new Date(ticket.slaDeadline) - new Date();
    if (diff < 0) {
      return 'BREACHED';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const getPriorityBadge = (p) => {
    const maps = {
      Low: 'bg-blue-50 text-blue-700 border-blue-200',
      Medium: 'bg-amber-50 text-amber-700 border-amber-200',
      High: 'bg-orange-50 text-corporate-orange border-orange-200',
      Critical: 'bg-red-50 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${maps[p] || 'bg-slate-50'}`}>
        {p}
      </span>
    );
  };

  const getStatusBadge = (s) => {
    const maps = {
      Open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Pending: 'bg-sky-50 text-sky-700 border-sky-200',
      Resolved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Closed: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return (
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${maps[s] || 'bg-slate-50'}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upper Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">IT Support Console</h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">Manage incident queues, assign technicians, and satisfy SLA targets.</p>
        </div>
        <button
          onClick={loadTickets}
          className="bg-white hover:bg-slate-50 border border-corporate-grayBorder text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 1. Incident Filter Bar */}
      <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Search tickets by ID, title, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-corporate-gray border border-corporate-grayBorder rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-corporate-blue text-slate-800"
          />
          <button 
            type="submit" 
            className="bg-corporate-blue hover:bg-corporate-blueLight text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-corporate-grayBorder rounded-xl px-2 py-1.5 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-corporate-grayBorder rounded-xl px-2 py-1.5 bg-white text-xs text-slate-800 outline-none"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Ticket Queue Grid */}
      {loading && tickets.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-corporate-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-corporate-grayBorder text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Incident Title</th>
                  <th className="px-6 py-3.5">Depart.</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">SLA Remaining</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-corporate-textMuted">
                      No tickets matching filter settings.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => {
                    const breached = isSlaBreached(t);
                    return (
                      <tr 
                        key={t.id || t._id}
                        onClick={() => handleTicketClick(t)}
                        className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                          breached ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-corporate-blue">
                          {(t.id || t._id).substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-800 font-semibold">
                          {t.title}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{t.department}</td>
                        <td className="px-6 py-4">{getPriorityBadge(t.priority)}</td>
                        <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                        <td className="px-6 py-4">
                          {breached ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                              <AlertTriangle className="w-3 h-3 mr-0.5" />
                              <span>SLA BREACH</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-600">
                              {getSlaTimeRemaining(t)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center text-[11px] font-bold text-corporate-orange hover:text-corporate-orangeHover">
                            <span>Open drawer</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IT Action Drawer Panel */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in-right relative">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-corporate-grayBorder flex items-center justify-between bg-corporate-blue text-white">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-corporate-orange">Support Incident File</span>
                <h3 className="font-extrabold text-base leading-tight mt-0.5 truncate max-w-md">
                  {selectedTicket.ticket.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white transition-colors hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Employee card */}
              <div className="bg-corporate-gray border border-corporate-grayBorder p-4 rounded-xl text-xs space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Submitted By</span>
                <div className="flex items-center justify-between text-slate-700">
                  <div className="font-semibold text-slate-800">
                    {selectedTicket.employee ? selectedTicket.employee.name : 'Unknown User'}
                  </div>
                  <div>Email: {selectedTicket.employee ? selectedTicket.employee.email : 'N/A'}</div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Department: <strong className="text-slate-600">{selectedTicket.ticket.department}</strong>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Update Lifecycle Status</h4>
                <div className="flex flex-wrap gap-2.5">
                  {['Open', 'Pending', 'Resolved', 'Closed'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(s)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        selectedTicket.ticket.status === s
                          ? 'bg-corporate-blue text-white border-corporate-blue'
                          : 'bg-white text-slate-600 border-corporate-grayBorder hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee modification dropdown */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assign Incident File</h4>
                <select
                  disabled={actionLoading}
                  value={selectedTicket.ticket.assignedTo || ''}
                  onChange={(e) => handleAssignTo(e.target.value)}
                  className="w-full px-3 py-2 border border-corporate-grayBorder focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white font-medium"
                >
                  <option value="">-- Unassigned Incident --</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.email})</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Problem Logs</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-corporate-gray/50 border border-slate-100 p-4 rounded-xl">
                  {selectedTicket.ticket.description}
                </p>
              </div>

              {/* Comments/Notes thread */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Communication Thread & Notes
                </h4>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedTicket.comments.length === 0 ? (
                    <p className="text-[11px] text-corporate-textMuted text-center py-4">No comments or activity notes logged.</p>
                  ) : (
                    selectedTicket.comments.map((comm) => (
                      <div 
                        key={comm.id || comm._id} 
                        className={`p-3 rounded-xl border ${
                          comm.isInternal 
                            ? 'bg-amber-50/60 border-amber-200/50 border-l-4 border-l-amber-500' 
                            : (comm.userRole !== 'Employee' ? 'bg-slate-50 border-corporate-grayBorder ml-4' : 'bg-corporate-orangeLight/20 border-corporate-orange/15 mr-4')
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span className={comm.isInternal ? 'text-amber-800 font-extrabold flex items-center' : (comm.userRole !== 'Employee' ? 'text-corporate-blue' : 'text-corporate-orange')}>
                            {comm.isInternal && <ShieldAlert className="w-3.5 h-3.5 mr-0.5 inline" />}
                            {comm.userName} ({comm.userRole}) {comm.isInternal && '[Internal Staff Note]'}
                          </span>
                          <span>
                            {new Date(comm.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">{comm.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <input 
                    type="text"
                    required
                    placeholder="Enter support comments or internal memo notes..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full border border-corporate-grayBorder rounded-xl px-4 py-2.5 text-xs focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue outline-none"
                  />
                  <div className="flex justify-between items-center">
                    <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 select-none cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="rounded text-corporate-orange focus:ring-corporate-orange focus:ring-0.5 border-corporate-grayBorder"
                      />
                      <span>Mark note as Internal (Staff Eyes Only)</span>
                    </label>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="bg-corporate-orange hover:bg-corporate-orangeHover text-white px-4 py-2 rounded-xl flex items-center justify-center font-bold text-xs transition-colors shadow-sm space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Reply</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
