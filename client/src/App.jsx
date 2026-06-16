import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');
  const { user, alert } = useAuth();

  // Redirect to dashboard if logged in and try to visit login
  useEffect(() => {
    if (user && currentPage === 'login') {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  const handleNavigate = (page) => {
    if (page === 'dashboard' && !user) {
      setCurrentPage('login');
    } else if (page === 'services') {
      setCurrentPage('landing');
      // Scroll to services section
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      setCurrentPage(page);
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'info':
      default:
        return 'bg-sky-50 text-sky-800 border-sky-200';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'error':
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-600" />;
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <>
            <LandingPage onNavigate={handleNavigate} />
            {/* Target ID for navbar scroll */}
            <div id="services-section"></div>
          </>
        );
      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard />;
      case 'kb':
        return (
          <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
            <KnowledgeBasePage />
          </div>
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const showNavbarAndFooter = currentPage !== 'dashboard' && currentPage !== 'login';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Alert Notification Banner */}
      {alert && (
        <div className="fixed top-20 right-4 z-50 animate-bounce max-w-md w-full">
          <div className={`p-4 rounded-xl border flex items-center space-x-3 shadow-lg ${getAlertStyle(alert.type)}`}>
            {getAlertIcon(alert.type)}
            <p className="text-xs font-bold leading-normal">{alert.message}</p>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      {showNavbarAndFooter && (
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      )}

      {/* Main Content Pane */}
      <div className="flex-grow">
        {renderPageContent()}
      </div>

      {/* Corporate Footer */}
      {showNavbarAndFooter && (
        <Footer onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
