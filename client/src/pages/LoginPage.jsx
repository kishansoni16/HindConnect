import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, ShieldAlert, User, Compass } from 'lucide-react';
import { api } from '../api';

const navItems = [
  { label: 'Home', id: 'landing' }
];

export default function LoginPage({ onLoginSuccess }) {
  const { login, loginWithOtp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Login states
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Registration states
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Employee');
  const [regDept, setRegDept] = useState('Refinery');
  const [regEmpCode, setRegEmpCode] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regDoj, setRegDoj] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('A+');
  const [regEmergencyContact, setRegEmergencyContact] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email) {
      setErrorMsg('Please enter your corporate email address first.');
      return;
    }
    try {
      setOtpLoading(true);
      const res = await api.sendOtp(email);
      setOtpSent(true);
      setSuccessMsg(res.message || 'Verification code sent to your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!otpCode) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    try {
      await loginWithOtp(email, otpCode);
      onLoginSuccess();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify OTP code.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setRegLoading(true);
      const res = await api.register(regName, regEmail, regPassword, regRole, regDept, {
        empCode: regEmpCode,
        designation: regDesignation,
        doj: regDoj,
        mobile: regMobile,
        bloodGroup: regBloodGroup,
        emergencyContact: regEmergencyContact
      });
      setSuccessMsg(res.message || 'Registration successful! Your account is pending IT Administrator approval.');
      // Clear registration form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('Employee');
      setRegDept('Refinery');
      setRegEmpCode('');
      setRegDesignation('');
      setRegDoj('');
      setRegMobile('');
      setRegBloodGroup('A+');
      setRegEmergencyContact('');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  // Quick select accounts for evaluator convenience
  const quickAccounts = [
    {
      role: 'Admin',
      name: 'Kishan Soni',
      email: 'kishanrkt16@gmail.com',
      dept: 'IT Support'
    },
    {
      role: 'Employee',
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@hindconnect.com',
      dept: 'Refinery'
    },
    {
      role: 'IT Staff',
      name: 'Amit Verma',
      email: 'amit.verma@hindconnect.com',
      dept: 'IT Support'
    },
    {
      role: 'Admin',
      name: 'Vikram Aditya',
      email: 'vikram.aditya@hindconnect.com',
      dept: 'IT Management'
    }
  ];

  const handleQuickSelect = (account) => {
    setEmail(account.email);
    setPassword('password123');
    setIsRegister(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-corporate-gray">
      {/* 1. Left side - Corporate brand & Illustration */}
      <div
        className="w-full md:w-1/2 text-white flex flex-col justify-between p-10 md:p-20 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(15, 41, 66, 0.93) 0%, rgba(30, 62, 98, 0.83) 100%), url('/backg.jpg')" }}
      >
        {/* Glow patterns */}
        <div className="absolute top-1/3 right-1/10 w-96 h-96 bg-corporate-orange/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand logo top */}
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

        {/* Corporate Quote / Welcome center */}
        <div className="space-y-6 max-w-lg my-12 z-10 font-sans">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-corporate-orange">
            <Landmark className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-white">Hindalco Industries Ltd.</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
            Connecting Enterprise Operations, Safely and Smartly.
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            Welcome to the HindConnect internal IT ecosystem. Authenticate using your active directory credentials to file claims, report network outages, request software licenses, and monitor service SLA tickets.
          </p>
          <div className="flex space-x-6 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <ShieldAlert className="w-4.5 h-4.5 text-corporate-orange" />
              <span className="font-bold">AES-256 Secure Auth</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-200">
              <Compass className="w-4.5 h-4.5 text-corporate-orange" />
              <span className="font-bold">Multi-site SLA Triage</span>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="text-[10px] text-slate-300 z-10 font-semibold">
          © 2026 HindConnect. Authorized Corporate Access Only.
        </div>
      </div>

      {/* 2. Right side - Form */}
      <div className="w-full md:w-1/2 bg-gradient-to-b from-slate-50 to-white flex flex-col justify-center p-8 sm:p-12 md:p-20 border-l border-corporate-grayBorder">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold text-corporate-blue tracking-tight">
              {isRegister ? 'Register Account' : 'Sign In to HindConnect'}
            </h2>
            <p className="text-xs text-corporate-textMuted mt-1.5 font-medium">
              {isRegister
                ? 'Create a corporate profile and submit it for IT Admin approval.'
                : 'Enter your corporate Active Directory credentials.'}
            </p>
          </div>

          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg text-xs text-red-750 font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg text-xs text-green-755 font-bold">
                {successMsg}
              </div>
            )}

            {isRegister ? (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="regName" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="regName"
                      type="text"
                      required
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="regEmail" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="regEmail"
                      type="email"
                      required
                      placeholder="name@hindconnect.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="regPassword" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="regPassword"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Role & Dept Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="regRole" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      System Role
                    </label>
                    <select
                      id="regRole"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <option value="Employee">Employee</option>
                      <option value="IT Staff">IT Staff</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="regDept" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Department
                    </label>
                    <select
                      id="regDept"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <option value="Refinery">Refinery</option>
                      <option value="Smelter">Smelter</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Finance">Finance</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>
                </div>

                {/* Employee Code & Designation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="regEmpCode" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Employee Code
                    </label>
                    <input
                      id="regEmpCode"
                      type="text"
                      required
                      placeholder="HC-EMP-12345"
                      value={regEmpCode}
                      onChange={(e) => setRegEmpCode(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="regDesignation" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Designation
                    </label>
                    <input
                      id="regDesignation"
                      type="text"
                      required
                      placeholder="e.g. Operator"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Date of Joining & Blood Group */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="regDoj" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Date of Joining
                    </label>
                    <input
                      id="regDoj"
                      type="text"
                      required
                      placeholder="e.g. 15 Aug 2024"
                      value={regDoj}
                      onChange={(e) => setRegDoj(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="regBloodGroup" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Blood Group
                    </label>
                    <select
                      id="regBloodGroup"
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300 cursor-pointer"
                    >
                      {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mobile Number & Emergency Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="regMobile" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Mobile Number
                    </label>
                    <input
                      id="regMobile"
                      type="text"
                      required
                      placeholder="+91 XXXXXXXXXX"
                      value={regMobile}
                      onChange={(e) => setRegMobile(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="regEmergencyContact" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                      Emergency Contact
                    </label>
                    <input
                      id="regEmergencyContact"
                      type="text"
                      required
                      placeholder="+91 XXXXXXXXXX"
                      value={regEmergencyContact}
                      onChange={(e) => setRegEmergencyContact(e.target.value)}
                      className="w-full px-3 py-3 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 outline-none bg-white transition-all hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3.5 px-4 bg-corporate-orange hover:bg-corporate-orangeHover text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-corporate-orange/20 flex justify-center items-center space-x-2 mt-2"
                >
                  {regLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Request Account Registration</span>
                  )}
                </button>
              </form>
            ) : (
              <div>
                {/* Login Type Selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => { setIsOtpMode(false); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`py-3.5 px-4 text-xs font-bold text-center rounded-xl transition-all cursor-pointer border flex items-center justify-center space-x-2 ${
                      !isOtpMode 
                        ? 'bg-corporate-orange text-white border-corporate-orange shadow-md shadow-corporate-orange/15' 
                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>Password Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsOtpMode(true); setErrorMsg(''); setSuccessMsg(''); }}
                    className={`py-3.5 px-4 text-xs font-bold text-center rounded-xl transition-all cursor-pointer border flex items-center justify-center space-x-2 ${
                      isOtpMode 
                        ? 'bg-corporate-orange text-white border-corporate-orange shadow-md shadow-corporate-orange/15' 
                        : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>OTP Login</span>
                  </button>
                </div>

                {!isOtpMode ? (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        Corporate Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="name@hindconnect.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          AD Password
                        </label>
                        <a className="text-[10px] font-semibold text-corporate-orange hover:text-corporate-orangeHover cursor-pointer">
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          id="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-corporate-orange hover:bg-corporate-orangeHover text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-corporate-orange/20 flex justify-center items-center space-x-2"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>Verify Credentials</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                    {/* Email Field */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        Corporate Email Address
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          id="email"
                          type="email"
                          required
                          disabled={otpSent}
                          placeholder="name@hindconnect.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3.5 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* OTP Code Field */}
                    {otpSent && (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label htmlFor="otpCode" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            6-Digit Verification Code
                          </label>
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtpCode(''); setErrorMsg(''); setSuccessMsg(''); }}
                            className="text-[10px] font-semibold text-corporate-orange hover:text-corporate-orangeHover"
                          >
                            Change Email
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            id="otpCode"
                            type="text"
                            maxLength={6}
                            required
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-full pl-10 pr-4 py-3.5 border border-slate-200 focus:border-corporate-orange focus:ring-2 focus:ring-corporate-orange/20 rounded-xl text-xs sm:text-sm text-slate-800 transition-all shadow-sm bg-slate-50/30 hover:border-slate-300 focus:bg-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || otpLoading}
                      className="w-full py-3.5 px-4 bg-corporate-orange hover:bg-corporate-orangeHover text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-corporate-orange/20 flex justify-center items-center space-x-2"
                    >
                      {loading || otpLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>{otpSent ? 'Verify & Sign In' : 'Request OTP Code'}</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Toggle form button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMsg('');
                  setSuccessMsg('');
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="text-xs font-bold text-corporate-blue hover:text-corporate-orange cursor-pointer transition-colors border border-slate-200 rounded-xl px-4 py-2 hover:bg-slate-50 shadow-sm"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register for access"}
              </button>
            </div>
          </div>

          {/* Developer Quick-Switcher Drawer */}
          <div className="pt-6 border-t border-corporate-grayBorder">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3.5 flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-corporate-orange" />
              <span>Developer Quick Switch (Evaluator Profiles)</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {quickAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => handleQuickSelect(account)}
                  className="flex items-center justify-between p-3 border border-slate-100 hover:border-corporate-orange/20 rounded-xl bg-white hover:bg-gradient-to-r hover:from-white hover:to-orange-50/10 text-left transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-corporate-blue/5 text-corporate-blue group-hover:bg-corporate-orange/10 group-hover:text-corporate-orange flex items-center justify-center font-bold text-xs transition-colors">
                      {account.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-corporate-orange transition-colors block">
                        {account.name}
                      </span>
                      <span className="text-[10px] text-corporate-textMuted block font-medium">
                        {account.email} • {account.dept}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase font-extrabold tracking-wide px-2 py-0.5 rounded bg-corporate-blueSoft text-corporate-blue border border-corporate-blueSoft/30 group-hover:bg-corporate-orangeLight group-hover:text-corporate-orange group-hover:border-corporate-orange/20 transition-all">
                    {account.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
