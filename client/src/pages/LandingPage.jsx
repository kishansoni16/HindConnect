import React from 'react';
import StatsCounter from '../components/StatsCounter';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Clock,
  Workflow,
  Lightbulb,
  Zap,
  BrainCircuit,
  FolderSearch,
  Database,
  BellRing,
  BarChart3,
  Cpu,
  ArrowRight,
  MonitorCheck
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const { user } = useAuth();

  // Hindalco corporate values cards data
  const values = [
    {
      title: 'Integrity',
      desc: 'Honesty, transparency, and ethical standards in every support transaction and SLA commitment.',
      color: 'border-blue-600/30 bg-blue-50/20 text-blue-800',
      icon: ShieldCheck,
      image: '/integrity.webp'
    },
    {
      title: 'Commitment',
      desc: 'Dedicated IT resolution pathways, standing by operations 24/7 to minimize production downtime.',
      color: 'border-orange-500/30 bg-orange-50/20 text-corporate-orange',
      icon: Clock,
      image: '/commitment.webp'
    },
    {
      title: 'Passion',
      desc: 'Striving for excellence in technological automation, delivering the highest quality internal tools.',
      color: 'border-pink-600/30 bg-pink-50/20 text-pink-800',
      icon: Lightbulb,
      image: '/passion.webp'
    },
    {
      title: 'Seamlessness',
      desc: 'Unified systems across smelters, refineries, and corporate nodes for uninterrupted data flow.',
      color: 'border-teal-600/30 bg-teal-50/20 text-teal-800',
      icon: Workflow,
      image: '/seamlessness.webp'
    },
    {
      title: 'Speed',
      desc: 'Rapid incident triage, leveraging AI classification to resolve critical tickets within SLA metrics.',
      color: 'border-red-600/30 bg-red-50/20 text-red-800',
      icon: Zap,
      image: '/speed.webp'
    }
  ];

  // Service grid data
  const services = [
    {
      title: 'AI Ticket Management',
      desc: 'Automated ticket categorization, priority scoring, and department routing via smart parsing.',
      icon: BrainCircuit
    },
    {
      title: 'Smart Issue Tracking',
      desc: 'Track support status transparently with detailed history, assignments, and resolution notes.',
      icon: MonitorCheck
    },
    {
      title: 'Knowledge Base',
      desc: 'Searchable manuals, setups, and FAQs, empowering employees with fast self-service fixes.',
      icon: FolderSearch
    },
    {
      title: 'IT Asset Requests',
      desc: 'Seamless request pipeline for system provisioning, access rights, and hardware allocations.',
      icon: Database
    },
    {
      title: 'Real-Time Alerts',
      desc: 'Instant updates regarding assignment modifications, status resolutions, or staff replies.',
      icon: BellRing
    },
    {
      title: 'Analytics Dashboard',
      desc: 'KPI monitoring dashboards displaying SLA metrics, queue weights, and agent resolutions.',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-corporate-gray min-h-screen pt-20">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-orange-50/30 text-slate-800 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-corporate-grayBorder">
        {/* Background Image overlay with transparency */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
          style={{ backgroundImage: "url('/backg.jpg')", opacity: 0.27 }}
        />
        {/* Glow patterns */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-corporate-orange/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-corporate-orangeLight border border-corporate-orange/20 px-3 py-1 rounded-full text-xs font-bold text-corporate-orange">
              <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Next-Gen Helpdesk Integration</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-corporate-blue">
              HindConnect
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">
              Intelligent IT Helpdesk & Support Portal
            </h2>
            <p className="text-sm sm:text-base text-corporate-textMuted max-w-xl leading-relaxed">
              Simplifying enterprise IT support through smart automation, AI-powered ticket management, and centralized issue tracking across all manufacturing refineries, smelters, and corporate offices.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-corporate-orange text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-corporate-orangeHover transition-all shadow-lg flex items-center space-x-2 border border-transparent"
              >
                <span>Raise Support Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Track Active Incident
              </button>
            </div>
          </div>

          {/* Right Hero - Mockup dashboard container */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white border border-corporate-grayBorder rounded-2xl p-6 shadow-premium text-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">HindConnect Engine</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">VPN Gateway Latency</h4>
                    <p className="text-[10px] text-slate-500">Corporate AD Server Node</p>
                  </div>
                  <span className="text-xs text-green-600 font-extrabold uppercase bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Operational</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-xs font-bold text-slate-800">IT Ticket Queue Weight</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">Triage Score</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div className="bg-corporate-orange h-full rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">AI Categorizer accuracy</h4>
                    <p className="text-[10px] text-slate-500">Pattern classification logs</p>
                  </div>
                  <span className="text-xs text-corporate-orange font-bold">98.2%</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                <span>API Status: 200 OK</span>
                <span>Active Engineers: 14 On-Call</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-corporate-orange">Our Core Standards</h2>
          <h3 className="text-3xl font-extrabold text-corporate-blue tracking-tight">Inspired by Corporate Values</h3>
          <p className="text-sm text-corporate-textMuted max-w-xl mx-auto leading-relaxed">
            Aligning HindConnect support mechanisms directly with the values governing our organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {values.map((v, index) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="bg-white border border-corporate-grayBorder hover:border-corporate-orange/30 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 group flex flex-col justify-between"
              >
                {/* Image Section with Overlay */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={v.image}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center bg-white shadow-md ${v.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-white text-base drop-shadow-md">{v.title}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <p className="text-xs text-corporate-textMuted leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Services Section */}
      <section className="bg-white border-y border-corporate-grayBorder py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-corporate-orange">Features Index</h2>
            <h3 className="text-3xl font-extrabold text-corporate-blue tracking-tight">IT Support Solutions</h3>
            <p className="text-sm text-corporate-textMuted max-w-xl mx-auto leading-relaxed">
              Equipped with analytical and AI frameworks to handle issues with structural precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="bg-corporate-gray border border-corporate-grayBorder hover:border-corporate-blue/20 rounded-2xl p-6 shadow-sm hover:shadow-premium transition-all duration-200 flex space-x-4"
                >
                  <div className="bg-corporate-blue/5 text-corporate-blue p-3 rounded-xl h-12 w-12 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-corporate-blue">{s.title}</h4>
                    <p className="text-xs text-corporate-textMuted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Live Analytics Ticker */}
      <section className="bg-gradient-to-r from-corporate-blueSoft via-white to-corporate-blueSoft border-y border-corporate-grayBorder text-slate-800 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-corporate-orange/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-corporate-orange">
                <StatsCounter target={15248} />
              </p>
              <p className="text-xs font-bold text-corporate-blue">Tickets Resolved</p>
              <p className="text-[10px] text-corporate-textMuted">Historical count</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-corporate-blue">
                <StatsCounter target={8420} />
              </p>
              <p className="text-xs font-bold text-corporate-blue">Active Users</p>
              <p className="text-[10px] text-corporate-textMuted">System nodes</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-green-600">
                <StatsCounter target={98.4} decimals={1} suffix="%" />
              </p>
              <p className="text-xs font-bold text-corporate-blue">SLA Compliance</p>
              <p className="text-[10px] text-corporate-textMuted">Target score</p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-corporate-blue">
                <StatsCounter target={2.4} decimals={1} suffix="h" />
              </p>
              <p className="text-xs font-bold text-corporate-blue">Avg Resolution</p>
              <p className="text-[10px] text-corporate-textMuted">S1-S4 incidents</p>
            </div>

            <div className="space-y-1 col-span-2 md:col-span-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-corporate-orange">
                <StatsCounter target={14} />
              </p>
              <p className="text-xs font-bold text-corporate-blue">Support Teams</p>
              <p className="text-[10px] text-corporate-textMuted">On-call standby</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
