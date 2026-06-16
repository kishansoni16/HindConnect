import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  X, 
  ChevronRight,
  Database,
  Briefcase
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, showAlert } = useAuth();
  
  // Stats states
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Users & Tabs states
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' vs 'users'
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown action states
  const [assigneeId, setAssigneeId] = useState('');
  const [priorityVal, setPriorityVal] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load analytical stats
      const analyticStats = await api.getAnalytics();
      setStats(analyticStats);

      // Load all tickets
      const allTickets = await api.getTickets({
        status: statusFilter,
        search: searchQuery
      });
      setTickets(allTickets);

      // Load IT Staff list
      const staff = await api.getItStaff();
      setStaffList(staff);

      // Load all registered users
      const allUsers = await api.getUsers();
      setUsersList(allUsers);
    } catch (err) {
      showAlert('Failed to load analytical metrics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAdminData();
  };

  const handleTicketClick = async (ticket) => {
    try {
      const detail = await api.getTicketById(ticket.id || ticket._id);
      setSelectedTicket(detail);
      setAssigneeId(detail.ticket.assignedTo || '');
      setPriorityVal(detail.ticket.priority || '');
    } catch (err) {
      showAlert('Failed to load incident detail: ' + err.message, 'error');
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setActionLoading(true);
      const ticketId = selectedTicket.ticket.id || selectedTicket.ticket._id;
      
      await api.updateTicket(ticketId, {
        assignedTo: assigneeId || null,
        priority: priorityVal
      });

      showAlert('Ticket details saved successfully', 'success');
      setSelectedTicket(null);
      loadAdminData();
    } catch (err) {
      showAlert('Failed to update ticket: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      setUserLoading(true);
      await api.approveUser(userId);
      showAlert('User account approved successfully. Credentials activated.', 'success');
      await loadAdminData();
      if (selectedUser && (selectedUser.id === userId || selectedUser._id === userId)) {
        setSelectedUser(null);
      }
    } catch (err) {
      showAlert('Failed to approve user: ' + err.message, 'error');
    } finally {
      setUserLoading(false);
    }
  };

  const COLORS = ['#0F2942', '#F26822', '#1E3E62', '#FF7E47', '#94A3B8'];

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
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-corporate-blue tracking-tight">Executive IT Analytics</h2>
          <p className="text-xs text-corporate-textMuted mt-0.5">Corporate infrastructure reports, SLA logs, and engineer loadings.</p>
        </div>
        <button
          onClick={loadAdminData}
          className="bg-white hover:bg-slate-50 border border-corporate-grayBorder text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Analytics</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-corporate-grayBorder space-x-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'analytics' 
              ? 'text-corporate-orange border-corporate-orange font-extrabold' 
              : 'text-slate-400 hover:text-slate-600 border-transparent'
          }`}
        >
          IT Support Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'users' 
              ? 'text-corporate-orange border-corporate-orange font-extrabold' 
              : 'text-slate-400 hover:text-slate-600 border-transparent'
          }`}
        >
          Registered Users Management
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-corporate-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* 1. Analytics Tab View */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Total Incidents</span>
                  <span className="text-2xl font-extrabold text-corporate-blue block mt-1">{stats.kpis.totalTickets}</span>
                </div>

                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Open Queue</span>
                  <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{stats.kpis.openTickets}</span>
                </div>

                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Pending Action</span>
                  <span className="text-2xl font-extrabold text-sky-600 block mt-1">{stats.kpis.pendingTickets}</span>
                </div>

                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Resolved Case</span>
                  <span className="text-2xl font-extrabold text-indigo-600 block mt-1">{stats.kpis.resolvedTickets}</span>
                </div>

                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">SLA Compliance</span>
                  <span className="text-2xl font-extrabold text-corporate-orange block mt-1">{stats.kpis.slaComplianceRatio}%</span>
                </div>

                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Active Violations</span>
                  <span className={`text-2xl font-extrabold block mt-1 ${stats.kpis.activeViolations > 0 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                    {stats.kpis.activeViolations}
                  </span>
                </div>
              </div>

              {/* Analytical Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Ticket Trends Line */}
                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm lg:col-span-8 space-y-4">
                  <h3 className="font-bold text-sm text-corporate-blue flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5 text-corporate-orange" />
                    <span>Ticket Volume Trends (Last 7 Days)</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.ticketTrends}>
                        <defs>
                          <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F2942" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0F2942" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F26822" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#F26822" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" name="Tickets Filed" dataKey="created" stroke="#0F2942" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                        <Area type="monotone" name="Tickets Resolved" dataKey="resolved" stroke="#F26822" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Pie */}
                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm lg:col-span-4 space-y-4">
                  <h3 className="font-bold text-sm text-corporate-blue flex items-center">
                    <Database className="w-4 h-4 mr-1.5 text-corporate-orange" />
                    <span>Issue Categories Distribution</span>
                  </h3>
                  <div className="h-64 flex flex-col justify-center">
                    <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={stats.categoriesBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.categoriesBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px' }} />
                        <Legend wrapperStyle={{ fontSize: '9px' }} verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department Load Bars */}
                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm lg:col-span-6 space-y-4">
                  <h3 className="font-bold text-sm text-corporate-blue flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5 text-corporate-orange" />
                    <span>Caseload Volume by Department</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.departmentBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="ticketsCount" name="Incident Volume" fill="#0F2942" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Engineer Capacities */}
                <div className="bg-white border border-corporate-grayBorder rounded-2xl p-5 shadow-sm lg:col-span-6 space-y-4">
                  <h3 className="font-bold text-sm text-corporate-blue flex items-center">
                    <Users className="w-4 h-4 mr-1.5 text-corporate-orange" />
                    <span>IT Staff Capacity & Performance</span>
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.engineerPerformance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="active" name="Active Load" fill="#1E3E62" stackId="a" radius={[0, 0, 0, 0]} barSize={20} />
                        <Bar dataKey="resolved" name="Resolved Count" fill="#F26822" stackId="a" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Global Ticket Ledger */}
              <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-corporate-grayBorder flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                  <h3 className="font-bold text-sm text-corporate-blue">Global Support Incident Ledger</h3>
                  
                  <div className="flex flex-wrap gap-2.5 items-center w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Filter by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border border-corporate-grayBorder rounded-lg px-3 py-1.5 text-xs outline-none text-slate-800"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-corporate-grayBorder rounded-lg px-2 py-1.5 bg-white text-xs outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button 
                      onClick={loadAdminData}
                      className="bg-corporate-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-corporate-blueLight"
                    >
                      Search
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-corporate-grayBorder text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-6 py-3">Incident ID</th>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Site Dept.</th>
                        <th className="px-6 py-3">Priority</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Assignee</th>
                        <th className="px-6 py-3 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-corporate-textMuted">
                            No support tickets found in ledger.
                          </td>
                        </tr>
                      ) : (
                        tickets.map((t) => {
                          const engineerName = staffList.find(s => s.id === t.assignedTo)?.name || 'Unassigned';
                          return (
                            <tr 
                              key={t.id || t._id}
                              onClick={() => handleTicketClick(t)}
                              className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 font-bold text-corporate-blue">
                                {(t.id || t._id).substring(0, 8).toUpperCase()}
                              </td>
                              <td className="px-6 py-4 truncate max-w-xs font-semibold text-slate-800">
                                {t.title}
                              </td>
                              <td className="px-6 py-4 text-slate-500">{t.department}</td>
                              <td className="px-6 py-4">{getPriorityBadge(t.priority)}</td>
                              <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                              <td className="px-6 py-4 font-semibold text-corporate-blue">{engineerName}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center text-[11px] font-bold text-corporate-orange hover:text-corporate-orangeHover">
                                  <span>Reassign</span>
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
            </div>
          )}

          {/* 2. Registered Users Tab View */}
          {activeTab === 'users' && (
            <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-corporate-grayBorder bg-slate-50/50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-sm text-corporate-blue">Registered System Users</h3>
                <span className="text-xs bg-corporate-blueSoft text-corporate-blue px-2.5 py-1 rounded-lg font-semibold border border-corporate-blueSoft/30">
                  Total Accounts: {usersList.length}
                </span>
              </div>
              
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-corporate-grayBorder text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Department</th>
                      <th className="px-6 py-3">System Role</th>
                      <th className="px-6 py-3">Account Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-corporate-textMuted">
                          No users registered in system.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr 
                          key={u.id || u._id}
                          className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                          onClick={() => setSelectedUser(u)}
                        >
                          <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-corporate-orange/10 text-corporate-orange flex items-center justify-center font-bold text-[10px] uppercase border border-corporate-orange/20">
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-corporate-blue">{u.email}</td>
                          <td className="px-6 py-4 text-slate-500">{u.department}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded bg-corporate-blueSoft text-corporate-blue border border-corporate-blueSoft/30 uppercase">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.isApproved ? (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span>Approved</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end items-center space-x-2.5">
                              {!u.isApproved && (
                                <button
                                  onClick={() => handleApproveUser(u.id || u._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="border border-corporate-grayBorder hover:bg-slate-50 text-slate-600 font-semibold text-[10px] px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Admin Modification Modal Dialog */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-zoom-in relative">
            <div className="px-6 py-4 bg-corporate-blue text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-corporate-orange">File Configuration</span>
                <h3 className="font-extrabold text-sm leading-tight truncate max-w-xs">{selectedTicket.ticket.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-corporate-grayBorder text-xs space-y-1.5">
                <div>Filer: <strong className="text-slate-800">{selectedTicket.employee?.name} ({selectedTicket.ticket.department})</strong></div>
                <div>Created: <span className="text-slate-500">{new Date(selectedTicket.ticket.createdAt).toLocaleString()}</span></div>
                <div>Status: <span className="font-bold text-slate-700">{selectedTicket.ticket.status}</span></div>
              </div>

              {/* Priority Choice */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">SLA Priority Rating</label>
                <select
                  value={priorityVal}
                  onChange={(e) => setPriorityVal(e.target.value)}
                  className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-850"
                >
                  <option value="Low">Low (72-hour SLA)</option>
                  <option value="Medium">Medium (48-hour SLA)</option>
                  <option value="High">High (24-hour SLA)</option>
                  <option value="Critical">Critical (4-hour SLA)</option>
                </select>
              </div>

              {/* Reassignment Choice */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Tech Group Assignment</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-850"
                >
                  <option value="">-- Unassigned Incident --</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-corporate-grayBorder text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-corporate-blue hover:bg-corporate-blueLight text-white rounded-xl text-xs font-bold transition-colors shadow"
                >
                  {actionLoading ? 'Saving...' : 'Apply Modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal Dialog */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-zoom-in relative">
            <div className="px-6 py-4 bg-corporate-blue text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-corporate-orange">User Directory Details</span>
                <h3 className="font-extrabold text-sm leading-tight truncate max-w-xs">{selectedUser.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-corporate-orange/10 text-corporate-orange flex items-center justify-center font-extrabold text-2xl uppercase border border-corporate-orange/20">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">{selectedUser.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Email Address</span>
                  <span className="font-bold text-slate-700">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Corporate Role</span>
                  <span className="inline-block text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded bg-corporate-blueSoft text-corporate-blue border border-corporate-blueSoft/30 uppercase">
                    {selectedUser.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Site Department</span>
                  <span className="font-bold text-slate-700">{selectedUser.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Account Status</span>
                  {selectedUser.isApproved ? (
                    <span className="text-green-600 font-bold">Approved & Active</span>
                  ) : (
                    <span className="text-amber-600 font-bold animate-pulse">Pending Approval</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2.5">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-corporate-grayBorder text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Close Details
                </button>
                {!selectedUser.isApproved && (
                  <button
                    onClick={() => handleApproveUser(selectedUser.id || selectedUser._id)}
                    disabled={userLoading}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors shadow"
                  >
                    {userLoading ? 'Approving...' : 'Approve Account'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
