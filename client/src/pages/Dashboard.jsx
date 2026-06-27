import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeDashboard from './EmployeeDashboard';
import CreateTicketPage from './CreateTicketPage';
import ItStaffDashboard from './ItStaffDashboard';
import AdminDashboard from './AdminDashboard';
import KnowledgeBasePage from './KnowledgeBasePage';
import { useAuth } from '../context/AuthContext';
import { Landmark, Menu, ShieldCheck, ChevronRight, X, LogOut } from 'lucide-react';

const getDossierDetails = (user) => {
  if (!user) return null;
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };
  
  const hash = getHash(user.email || user.name);
  const isSeeded = user.email && (
    user.email.endsWith('@hindconnect.com') && 
    !user.email.includes('.new') && 
    user.email !== 'vishesh4757@gmail.com'
  );

  const mobile = user.mobile || (isSeeded ? `+91 987${(hash % 900000) + 100000}` : 'Not Set');
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
  const bloodGroup = user.bloodGroup || (isSeeded ? bloodGroups[hash % bloodGroups.length] : 'Not Set');
  
  const yearsAgo = (hash % 6) + 1;
  const doj = user.doj || (isSeeded ? new Date(2026 - yearsAgo, hash % 12, (hash % 28) + 1).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : 'Not Set');
  
  const empCode = user.empCode || (isSeeded ? `HC-EMP-${(hash % 90000) + 10000}` : 'Not Set');
  
  const designationMap = {
    Employee: 'Operations Supervisor',
    'IT Staff': 'Network Systems Administrator',
    Admin: 'Principal Systems Administrator'
  };
  const designation = user.designation || (isSeeded ? (designationMap[user.role] || 'Associate Engineer') : 'Not Set');
  
  const emergencyContact = user.emergencyContact || (isSeeded ? `+91 961${(hash % 800000) + 100000}` : 'Not Set');

  return { mobile, bloodGroup, doj, empCode, designation, emergencyContact };
};

export default function Dashboard() {
  const { user, loading, updateUserProfile, logout } = useAuth();
  const [currentSubpage, setCurrentSubpage] = useState('');
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmpCode, setEditEmpCode] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editDoj, setEditDoj] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleOpenEditModal = () => {
    const details = getDossierDetails(user);
    setEditEmpCode(user.empCode || details?.empCode || '');
    setEditDesignation(user.designation || details?.designation || '');
    setEditDoj(user.doj || details?.doj || '');
    setEditMobile(user.mobile || details?.mobile || '');
    setEditBloodGroup(user.bloodGroup || details?.bloodGroup || 'A+');
    setEditEmergencyContact(user.emergencyContact || details?.emergencyContact || '');
    setSaveError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');
    try {
      setSaveLoading(true);
      await updateUserProfile({
        empCode: editEmpCode,
        designation: editDesignation,
        doj: editDoj,
        mobile: editMobile,
        bloodGroup: editBloodGroup,
        emergencyContact: editEmergencyContact
      });
      setIsEditModalOpen(false);
    } catch (err) {
      setSaveError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Set default subpage based on role when user loads
  useEffect(() => {
    if (user) {
      if (user.role === 'Employee') {
        setCurrentSubpage('dashboard_home');
      } else if (user.role === 'IT Staff') {
        setCurrentSubpage('staff_home');
      } else if (user.role === 'Admin') {
        setCurrentSubpage('admin_home');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-corporate-gray flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-corporate-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-corporate-gray flex flex-col justify-center items-center p-6 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500 border border-red-200">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h3 className="font-extrabold text-lg text-corporate-blue">Session Expired / Unauthorized</h3>
        <p className="text-xs text-corporate-textMuted max-w-sm">
          You must sign in to view the HindConnect dashboard.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-corporate-blue text-white px-5 py-2 rounded-xl font-semibold text-xs shadow hover:bg-corporate-blueLight transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  // Subpage router
  const renderSubpageContent = () => {
    switch (currentSubpage) {
      // Employee subpages
      case 'dashboard_home':
        return <EmployeeDashboard onNavigateSubpage={setCurrentSubpage} />;
      case 'raise_ticket':
        return <CreateTicketPage onNavigateSubpage={setCurrentSubpage} />;
      case 'my_tickets':
        return <EmployeeDashboard onNavigateSubpage={setCurrentSubpage} />;

      // IT Staff subpages
      case 'staff_home':
        return <ItStaffDashboard />;

      // Admin subpages
      case 'admin_home':
        return <AdminDashboard />;
      case 'admin_tickets':
        return <ItStaffDashboard />; // Reuse IT Staff view to let admins manage and reassign all tickets

      // Shared subpages
      case 'kb':
        return <KnowledgeBasePage />;

      default:
        return (
          <div className="text-center py-20 text-xs text-corporate-textMuted">
            Under Construction. Selection code: {currentSubpage}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-corporate-gray text-slate-800">
      {/* 1. Sidebar Panel (Left) */}
      <Sidebar currentSubpage={currentSubpage} onSubpageChange={setCurrentSubpage} />

      {/* 2. Content Framework Panel (Right) */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Mini Header */}
        <header className="bg-white border-b border-corporate-grayBorder h-16 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold text-corporate-textMuted">
            <span>HindConnect Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-corporate-blue font-bold capitalize">
              {currentSubpage.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold">
            <span className="bg-corporate-orange/15 text-corporate-orange px-2 py-0.5 rounded border border-corporate-orange/20 font-bold uppercase tracking-wider text-[9px]">
              AD Active
            </span>
            <span>Support Ext: 4400</span>
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="ml-2 flex items-center space-x-1.5 px-3 py-1.5 border border-red-200 hover:border-red-300 text-red-650 hover:text-red-700 bg-red-50/50 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-all shadow-sm cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Dashboard</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto pb-16 space-y-6">
          {/* Digital Employee Dossier Card */}
          {user && (
            <div className="bg-white border border-corporate-grayBorder rounded-2xl shadow-premium overflow-hidden transition-all duration-300">
              {/* Header ribbon */}
              <div 
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
                className="bg-gradient-to-r from-corporate-blue to-corporate-blueLight px-6 py-3 flex justify-between items-center cursor-pointer select-none"
              >
                <div className="flex items-center space-x-2 text-white">
                  <Landmark className="w-4 h-4 text-corporate-orange" />
                  <span className="text-xs font-bold uppercase tracking-wider">Hindalco Employee Digital Identity Dossier</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded font-bold uppercase">
                    HC-Node Verified
                  </span>
                  <span className="text-white text-xs font-bold">
                    {isProfileExpanded ? 'Collapse ▲' : 'Expand ▼'}
                  </span>
                </div>
              </div>

              {isProfileExpanded && (
                <div className="p-6 bg-gradient-to-r from-slate-50/50 via-white to-white grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Photo / Avatar Section (Col-span-3) */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-3 border-r border-slate-100 pr-0 md:pr-6">
                    <div className="relative">
                      {/* Big styled profile picture placeholder */}
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-corporate-blue to-corporate-orange text-white flex items-center justify-center font-bold text-4xl shadow-lg border-4 border-white relative">
                        {user.name.charAt(0)}
                      </div>
                      {/* Online Status Dot */}
                      <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-corporate-blue leading-tight">{user.name}</h3>
                      <p className="text-xs font-semibold text-corporate-orange mt-0.5">{getDossierDetails(user)?.empCode}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{getDossierDetails(user)?.designation}</p>
                    </div>
                  </div>

                  {/* Profile Details Grid (Col-span-9) */}
                  <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs pl-0 md:pl-2">
                    
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Corporate Email</span>
                      <span className="font-bold text-corporate-blue block break-all">{user.email}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Mobile Number</span>
                      <span className="font-bold text-slate-800 block">{getDossierDetails(user)?.mobile}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Department Node</span>
                      <span className="font-bold text-slate-800 block">{user.department}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Date of Joining</span>
                      <span className="font-bold text-slate-800 block">{getDossierDetails(user)?.doj}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Blood Group</span>
                      <span className="font-bold text-red-600 block text-sm">{getDossierDetails(user)?.bloodGroup}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Emergency Support Node</span>
                      <span className="font-bold text-slate-800 block">{getDossierDetails(user)?.emergencyContact}</span>
                    </div>

                    <div className="col-span-2 sm:col-span-3 flex justify-end pt-4 border-t border-slate-100/50">
                      <button
                        onClick={handleOpenEditModal}
                        className="bg-corporate-orange hover:bg-corporate-orangeHover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
                      >
                        Update Dossier Details
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {renderSubpageContent()}
        </main>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-zoom-in relative">
            <div className="px-6 py-4 bg-corporate-blue text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-corporate-orange">Dossier Details Update</span>
                <h3 className="font-extrabold text-sm leading-tight">Edit Basic Profile Details</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
              {/* Inline error display */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
                  ⚠ {saveError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Employee Code</label>
                  <input
                    type="text"
                    required
                    placeholder="HC-EMP-XXXXX"
                    value={editEmpCode}
                    onChange={(e) => setEditEmpCode(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Associate Engineer"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Date of Joining</label>
                  <input
                    type="date"
                    required
                    value={editDoj}
                    onChange={(e) => setEditDoj(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800 text-slate-800"
                  >
                    {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Mobile Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 XXXXXXXXXX"
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Emergency Contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 XXXXXXXXXX"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 border border-corporate-grayBorder rounded-xl text-xs outline-none bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-corporate-grayBorder text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-corporate-orange hover:bg-corporate-orangeHover text-white rounded-xl text-xs font-bold transition-colors shadow"
                >
                  {saveLoading ? 'Saving...' : 'Save Dossier Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
