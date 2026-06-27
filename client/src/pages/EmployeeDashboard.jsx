import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  PlusCircle, 
  MessageSquare, 
  RefreshCw, 
  Send,
  User as UserIcon,
  ChevronRight,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function EmployeeDashboard({ onNavigateSubpage }) {
  const { user, showAlert } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitCommentLoading, setSubmitCommentLoading] = useState(false);
  const [activities, setActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getTickets();
      setTickets(data);
      
      // Calculate recent activities across all tickets
      const activityPromises = data.slice(0, 5).map(async (t) => {
        try {
          const detail = await api.getTicketById(t.id || t._id);
          return detail.activities || [];
        } catch (e) {
          return [];
        }
      });
      const allActs = await Promise.all(activityPromises);
      const flatActs = allActs.flat().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
      setActivities(flatActs);
    } catch (err) {
      showAlert('Failed to load tickets: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTicketClick = async (ticket) => {
    try {
      const detail = await api.getTicketById(ticket.id || ticket._id);
      setSelectedTicket(detail);
    } catch (err) {
      showAlert('Failed to load ticket details: ' + err.message, 'error');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitCommentLoading(true);
      const ticketId = selectedTicket.ticket.id || selectedTicket.ticket._id;
      const newComment = await api.addComment(ticketId, commentText);
      
      // Refresh ticket detail
      const refreshedDetail = await api.getTicketById(ticketId);
      setSelectedTicket(refreshedDetail);
      setCommentText('');
      showAlert('Comment posted successfully', 'success');
    } catch (err) {
      showAlert('Failed to post comment: ' + err.message, 'error');
    } finally {
      setSubmitCommentLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const ticketId = selectedTicket.ticket.id || selectedTicket.ticket._id;
      await api.updateTicket(ticketId, { status: 'Closed' });
      
      // Refresh detail and main list
      const refreshedDetail = await api.getTicketById(ticketId);
      setSelectedTicket(refreshedDetail);
      loadDashboardData();
      showAlert('Ticket marked as Closed', 'success');
    } catch (err) {
      showAlert('Failed to close ticket: ' + err.message, 'error');
    }
  };

  // KPI count aggregates
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const criticalCount = tickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;

  const getPriorityBadge = (p) => {
    const maps = {
      Low: 'bg-blue-50 text-blue-700 border-blue-200',
      Medium: 'bg-amber-50 text-amber-700 border-amber-200',
      High: 'bg-orange-50 text-corporate-orange border-orange-200',
      Critical: 'bg-red-50 text-red-700 border-red-200 animate-pulse'
    };
    return (
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${maps[p] || 'bg-slate-50 text-slate-700'}`}>
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
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${maps[s] || 'bg-slate-50 text-slate-700'}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">Support Dashboard</h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">Welcome back, {user.name}. Track your open IT incidents.</p>
        </div>
      </div>

      {loading && tickets.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-corporate-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 1. Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-corporate-blue">{openCount}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Open Tickets</p>
              </div>
            </div>

            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-corporate-blue">{pendingCount}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pending</p>
              </div>
            </div>

            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-corporate-blue">{resolvedCount}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Resolved</p>
              </div>
            </div>

            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-700 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-extrabold text-corporate-blue">{criticalCount}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Critical Issues</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 2. Ticket Table */}
            <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden lg:col-span-8">
              <div className="px-6 py-4 border-b border-corporate-grayBorder flex items-center justify-between">
                <h3 className="font-bold text-sm text-corporate-blue">My Active Incidents</h3>
                <button 
                  onClick={loadDashboardData}
                  className="p-1.5 text-corporate-textMuted hover:text-corporate-blue transition-colors rounded-lg hover:bg-slate-50"
                  title="Reload list"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-corporate-grayBorder text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-3">Ticket ID</th>
                      <th className="px-6 py-3">Issue Title</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-corporate-textMuted">
                          You do not have any registered support tickets.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((t) => (
                        <tr 
                          key={t.id || t._id}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => handleTicketClick(t)}
                        >
                          <td className="px-6 py-4 font-bold text-corporate-blue">
                            {(t.id || t._id).substring(0, 8).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 max-w-[200px] truncate text-slate-800 font-semibold">
                            {t.title}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {t.category}
                          </td>
                          <td className="px-6 py-4">
                            {getPriorityBadge(t.priority)}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(t.status)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center text-[11px] font-bold text-corporate-orange hover:text-corporate-orangeHover">
                              <span>Detail</span>
                              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Recent Activity Timeline */}
            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-6 shadow-sm lg:col-span-4 space-y-4">
              <h3 className="font-bold text-sm text-corporate-blue border-b border-slate-100 pb-3">Recent Activity Timeline</h3>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-center text-xs text-corporate-textMuted py-4">No recent activity logged.</p>
                ) : (
                  activities.map((act) => (
                    <div key={act.id || act._id} className="relative pl-5 border-l border-slate-200 text-xs">
                      {/* Timeline dot */}
                      <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-corporate-orange/20 border-2 border-corporate-orange"></span>
                      <p className="font-bold text-slate-800 text-[11px] leading-snug">{act.action}</p>
                      <p className="text-slate-500 text-[10px] mt-0.5 leading-relaxed">{act.details}</p>
                      <span className="text-[9px] text-corporate-textMuted mt-1 block">
                        {new Date(act.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ticket Details Drawer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in-right relative">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-corporate-grayBorder flex items-center justify-between bg-corporate-blue text-white">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-corporate-orange">Ticket Details</span>
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

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Info panel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-corporate-grayBorder rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Priority</span>
                  <span className="mt-1 block">{getPriorityBadge(selectedTicket.ticket.priority)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Status</span>
                  <span className="mt-1 block">{getStatusBadge(selectedTicket.ticket.status)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Engineer</span>
                  <span className="font-bold text-corporate-blue mt-1 block">
                    {selectedTicket.assignee ? selectedTicket.assignee.name : 'Awaiting Assignment'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">SLA Deadline</span>
                  <span className="font-bold text-slate-700 mt-1 block">
                    {selectedTicket.ticket.slaDeadline 
                      ? new Date(selectedTicket.ticket.slaDeadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Incident Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-corporate-gray/50 border border-slate-100 p-4 rounded-xl">
                  {selectedTicket.ticket.description}
                </p>
              </div>

              {/* Attachments Display */}
              {selectedTicket.ticket.attachments && selectedTicket.ticket.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Attachments</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {selectedTicket.ticket.attachments.map((att, idx) => {
                      const isImg = att.type && att.type.startsWith('image/');
                      return (
                        <div key={idx} className="bg-slate-50 border border-corporate-grayBorder rounded-xl p-3 flex flex-col justify-between space-y-2">
                          <div className="flex items-center space-x-2">
                            {isImg ? (
                              <img src={att.data} alt={att.name} className="w-8 h-8 rounded object-cover border border-slate-200" />
                            ) : (
                              <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                            )}
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[170px]" title={att.name}>
                              {att.name}
                            </span>
                          </div>
                          <a
                            href={att.data}
                            download={att.name}
                            className="bg-white hover:bg-slate-50 border border-corporate-grayBorder text-[10px] font-bold py-1 px-2.5 rounded-lg text-center text-corporate-blue transition-colors self-start"
                          >
                            Download
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1 text-corporate-orange" />
                  <span>Discussion ({selectedTicket.comments.length})</span>
                </h4>
                
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {selectedTicket.comments.length === 0 ? (
                    <p className="text-[11px] text-corporate-textMuted text-center py-4">No replies posted yet.</p>
                  ) : (
                    selectedTicket.comments.map((comm) => (
                      <div 
                        key={comm.id || comm._id} 
                        className={`p-3 rounded-xl border ${
                          comm.userRole !== 'Employee' 
                            ? 'bg-slate-50 border-corporate-grayBorder ml-6' 
                            : 'bg-corporate-orangeLight/20 border-corporate-orange/10 mr-6'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                          <span className={comm.userRole !== 'Employee' ? 'text-corporate-blue' : 'text-corporate-orange'}>
                            {comm.userName} ({comm.userRole})
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

                {/* Comment Input */}
                {selectedTicket.ticket.status !== 'Closed' ? (
                  <form onSubmit={handlePostComment} className="flex space-x-2">
                    <input 
                      type="text"
                      required
                      placeholder="Add a reply to IT support..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 border border-corporate-grayBorder rounded-xl px-4 py-2.5 text-xs focus:border-corporate-blue focus:ring-1 focus:ring-corporate-blue outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submitCommentLoading}
                      className="bg-corporate-blue hover:bg-corporate-blueLight text-white px-4 py-2 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow"
                    >
                      {submitCommentLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-100 p-3 rounded-xl text-center text-xs text-slate-500 font-semibold">
                    This ticket is closed. Further replies are blocked.
                  </div>
                )}
              </div>
            </div>

            {/* Action Footer */}
            {selectedTicket.ticket.status !== 'Closed' && (
              <div className="px-6 py-4 border-t border-corporate-grayBorder bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleCloseTicket}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Close Incident
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
