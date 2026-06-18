import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Cpu, HelpCircle } from 'lucide-react';
import { api } from '../api';

const NamasteIcon = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Left Hand */}
    <path d="M10 21s-1-3.5-1-6.5C9 10.5 12 7.5 12 3.5" />
    <path d="M8.5 21S7 18 7.5 14.5c.3-2.5 2-4.5 2.5-6.5" />
    {/* Right Hand */}
    <path d="M14 21s1-3.5 1-6.5c0-4-3-7-3-11" />
    <path d="M15.5 21S17 18 16.5 14.5c-.3-2.5-2-4.5-2.5-6.5" />
    {/* Wrist base */}
    <path d="M9.5 21h5" />
  </svg>
);


export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your HindConnect Support Assistant. How can I help you today? I can answer questions about VPN access, printer mappings, SAP access, Active Directory resets, or help you track incident reports.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    { label: 'VPN Connection', query: 'How do I connect to the corporate VPN?' },
    { label: 'Printer Card Setup', query: 'How do I map my badge card to the office printers?' },
    { label: 'Reset AD Password', query: 'How can I reset my Active Directory password?' },
    { label: 'ERP SAP Access', query: 'How do I request transactional access for SAP S/4HANA?' },
    { label: 'Check SLA Times', query: 'What are the incident resolution SLA timelines?' }
  ];

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || message;
    if (!queryText.trim()) return;

    // Add user message to history
    const userMsg = { sender: 'user', text: queryText, timestamp: new Date() };
    setChatHistory((prev) => [...prev, userMsg]);
    if (!textToSend) setMessage('');
    
    setIsLoading(true);

    try {
      // Send chat message with history (exclude timestamps for API request payload)
      const apiHistory = chatHistory.map(h => ({ sender: h.sender, text: h.text }));
      const response = await api.chat(queryText, apiHistory);
      
      const botMsg = { sender: 'bot', text: response.text, timestamp: new Date() };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat widget error:', err);
      const errorMsg = { 
        sender: 'bot', 
        text: 'Sorry, I am experiencing network difficulties. Please ensure your backend server is running and database is connected.', 
        timestamp: new Date() 
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const formatMessageText = (text) => {
    // Basic Markdown helper
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formatted = formatted.split('\n').map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li class="list-disc list-inside ml-2 my-0.5 text-slate-700">${trimmed.substring(2)}</li>`;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s/, '');
        return `<li class="list-decimal list-inside ml-2 my-0.5 text-slate-700">${content}</li>`;
      }
      return trimmed ? `<p class="mb-1 text-slate-700">${trimmed}</p>` : '';
    }).join('');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} className="text-xs leading-relaxed space-y-0.5" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Chat Window Container */}
      <div 
        className={`bg-white rounded-2xl shadow-premium border border-slate-200/80 w-[350px] sm:w-[380px] h-[500px] flex flex-col mb-4 overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-corporate-blue to-corporate-blue/90 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-corporate-orange animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">HindConnect AI</h3>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                <span className="text-[10px] text-slate-200 font-semibold">Virtual Support standby</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {chatHistory.map((msg, index) => (
            <div 
              key={index}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              } animate-fade-in`}
            >
              <div 
                className={`p-3 rounded-2xl shadow-sm text-xs ${
                  msg.sender === 'user' 
                    ? 'bg-corporate-orange text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-line text-xs font-semibold">{msg.text}</p>
                ) : (
                  formatMessageText(msg.text)
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start max-w-[85%]">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center justify-center">
                <div className="flex space-x-1 items-center py-1 px-1.5">
                  <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-corporate-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto whitespace-nowrap scrollbar-none flex space-x-2">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 bg-slate-100 hover:bg-corporate-orangeLight hover:text-corporate-orange border border-slate-200 hover:border-corporate-orange/20 rounded-full px-3 py-1 text-[10px] font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask a support question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-corporate-blue focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!message.trim() || isLoading}
            className="bg-corporate-blue hover:bg-corporate-blueHover text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Floating Toggle Button with Greeting Badge */}
      <div className="flex items-center">
        {!isOpen && (
          <div className="mr-3 bg-white/95 border border-amber-200/60 backdrop-blur-sm shadow-premium rounded-2xl py-2 px-3.5 text-[11px] font-extrabold text-amber-600 flex items-center space-x-1.5 animate-bounce select-none border-l-4 border-l-amber-500">
            <span>Namaste! Ask AI</span>
            <span className="text-sm animate-pulse">🙏</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 hover:from-amber-500 hover:via-orange-600 hover:to-rose-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.45)] hover:shadow-[0_6px_24px_rgba(249,115,22,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer relative group"
          aria-label="Toggle chat helper"
        >
          <div className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center animate-pulse">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
          </div>
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
          ) : (
            <span className="text-2xl transform transition-transform duration-300 group-hover:scale-120 group-hover:rotate-6 select-none">
              🙏
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
