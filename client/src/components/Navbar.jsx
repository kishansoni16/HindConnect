import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, ShieldAlert, BookOpen, Menu, X, Landmark } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, logout, notifications, unreadNotificationsCount, markNotificationsRead } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNotifClick = () => {
    setShowNotifDropdown(!showNotifDropdown);
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
    setShowNotifDropdown(false);
  };

  const handleMarkAllRead = async () => {
    await markNotificationsRead();
  };

  const linkClass = (page) => `
    relative text-sm font-semibold tracking-wide transition-colors duration-200 cursor-pointer py-2
    ${currentPage === page
      ? 'text-corporate-orange border-b-2 border-corporate-orange'
      : 'text-slate-600 hover:text-corporate-orange'}
  `;

  const navItems = [
    { label: 'Home', id: 'landing' },
    { label: 'Services', id: 'services' },
    { label: 'IT Support', id: 'dashboard' },
    { label: 'Knowledge Base', id: 'kb' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-corporate-grayBorder py-3 ${scrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-18 h-18">
              <img src="/logo.webp" alt="HindConnect Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block text-corporate-blue">
                HindConnect
              </span>
              <span className="text-[10px] uppercase tracking-widest text-corporate-orange font-bold -mt-1 block">
                HINDALCO INDUSTRIES LIMITED
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={linkClass(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={handleNotifClick}
                    className="p-2 rounded-full transition-colors relative hover:bg-slate-100 text-slate-600"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-corporate-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-corporate-grayBorder shadow-premium rounded-xl py-2 z-50 text-slate-800 overflow-hidden">
                      <div className="px-4 py-2 border-b border-corporate-grayBorder flex items-center justify-between">
                        <span className="font-semibold text-sm text-corporate-blue">Notifications</span>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-corporate-orange hover:text-corporate-orangeHover font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-corporate-textMuted">
                            No notifications to display
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id || notif._id}
                              className={`px-4 py-3 border-b border-slate-100 text-xs hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-corporate-orangeLight/40 border-l-4 border-corporate-orange' : ''
                                }`}
                            >
                              <p className="font-medium text-slate-700">{notif.message}</p>
                              <span className="text-[10px] text-corporate-textMuted mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Controls */}
                <div className="relative">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-corporate-grayBorder hover:bg-slate-50 text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-corporate-orange/20 text-corporate-orange flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold leading-none">{user.name}</p>
                      <p className="text-[10px] text-corporate-textMuted leading-tight">{user.role}</p>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-corporate-grayBorder shadow-premium rounded-xl py-2 z-50 text-slate-800">
                      <div className="px-4 py-2 border-b border-corporate-grayBorder">
                        <p className="text-xs text-corporate-textMuted">Logged in as</p>
                        <p className="font-bold text-sm text-corporate-blue truncate">{user.email}</p>
                        <p className="text-[10px] font-semibold text-corporate-orange mt-0.5">{user.department} Dept</p>
                      </div>
                      <a
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onNavigate('dashboard');
                        }}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4 text-corporate-textMuted" />
                        <span>Support Dashboard</span>
                      </a>
                      <hr className="border-slate-100" />
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                          onNavigate('landing');
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-semibold px-5 py-2 rounded-lg transition-all duration-200 shadow-md bg-corporate-blue text-white hover:bg-corporate-blueLight"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-800 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-corporate-grayBorder py-4 px-6 space-y-4">
          <div className="space-y-2 flex flex-col">
            {navItems.map((item) => (
              <a
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className="text-sm font-semibold text-slate-700 hover:text-corporate-orange py-2 block border-b border-slate-100 cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* User Section Mobile */}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-corporate-orange/20 text-corporate-orange flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-corporate-blue">{user.name}</h4>
                    <p className="text-xs text-corporate-textMuted">{user.role} ({user.department})</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('dashboard');
                  }}
                  className="w-full text-center text-xs font-semibold py-2 px-4 rounded-lg bg-corporate-blue text-white hover:bg-corporate-blueLight block"
                >
                  Support Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    onNavigate('landing');
                  }}
                  className="w-full text-center text-xs font-semibold py-2 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 block"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="w-full text-center text-xs font-semibold py-2.5 px-4 rounded-lg bg-corporate-orange text-white hover:bg-corporate-orangeHover block shadow"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
