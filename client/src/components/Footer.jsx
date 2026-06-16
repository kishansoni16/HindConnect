import React from 'react';
import { Landmark, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-corporate-dark text-slate-400 border-t border-slate-800">
      {/* Top Footer Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand block */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="bg-white p-1 rounded-lg flex items-center justify-center w-8 h-8 border border-slate-100/10">
                <img src="/logo.webp" alt="HindConnect Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">HindConnect</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-slate-400">
              Simplifying enterprise IT support through advanced automation, AI-assisted ticket prioritization, and centralized issue tracking for Hindalco's manufacturing and administrative divisions.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4 border-l-2 border-corporate-orange pl-2">
              Sitemap
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a onClick={() => onNavigate('landing')} className="hover:text-white transition-colors cursor-pointer flex items-center">
                  <span>Home Landing</span>
                </a>
              </li>
              <li>
                <a onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors cursor-pointer flex items-center">
                  <span>Support Center</span>
                </a>
              </li>
              <li>
                <a onClick={() => onNavigate('kb')} className="hover:text-white transition-colors cursor-pointer flex items-center">
                  <span>Knowledge Base</span>
                </a>
              </li>
              <li>
                <a href="https://www.hindalco.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center space-x-1">
                  <span>Corporate Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency contacts */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4 border-l-2 border-corporate-orange pl-2">
              IT Helpline
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-corporate-orange" />
                <a href="mailto:support@hindconnect.com" className="hover:text-white transition-colors">
                  support@hindconnect.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-corporate-orange" />
                <span>Internal Ext: 4400 / 4405</span>
              </li>
              <li className="text-[11px] text-slate-500 pt-1 leading-snug">
                Helpline Hours: 24/7 Corporate Standby (Refinery & Smelter operations priority support).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Panel */}
      <div className="bg-slate-950 border-t border-slate-900/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 HindConnect. All Rights Reserved. Confidential Internal IT Tool.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a className="hover:underline cursor-pointer">Security Compliance</a>
            <a className="hover:underline cursor-pointer">Privacy Policy</a>
            <a className="hover:underline cursor-pointer">SLA Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
