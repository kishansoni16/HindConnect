import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import EmployeeDashboard from './EmployeeDashboard';
import CreateTicketPage from './CreateTicketPage';
import ItStaffDashboard from './ItStaffDashboard';
import AdminDashboard from './AdminDashboard';
import KnowledgeBasePage from './KnowledgeBasePage';
import { useAuth } from '../context/AuthContext';
import { Landmark, Menu, ShieldCheck, ChevronRight } from 'lucide-react';

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
  const mobile = `+91 987${(hash % 900000) + 100000}`;
  const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'];
  const bloodGroup = bloodGroups[hash % bloodGroups.length];
  
  const yearsAgo = (hash % 6) + 1;
  const doj = new Date(2026 - yearsAgo, hash % 12, (hash % 28) + 1).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const empCode = `HC-EMP-${(hash % 90000) + 10000}`;
  
  const designationMap = {
    Employee: 'Operations Supervisor',
    'IT Staff': 'Network Systems Administrator',
    Admin: 'Principal Systems Administrator'
  };
  const designation = designationMap[user.role] || 'Associate Engineer';
  
  const emergencyContact = `+91 961${(hash % 800000) + 100000}`;

  return { mobile, bloodGroup, doj, empCode, designation, emergencyContact };
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [currentSubpage, setCurrentSubpage] = useState('');
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);

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

                  </div>
                </div>
              )}
            </div>
          )}

          {renderSubpageContent()}
        </main>
      </div>
    </div>
  );
}
