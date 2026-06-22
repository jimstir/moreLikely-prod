"use client";

import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'agent', content: 'How can I help you analyze the prediction markets today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const address = localStorage.getItem('connected_wallet') || 'anonymous';
    
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, marketId: 'GENERAL', query: userMsg })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: data.message || data.error || "I processed your request." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: "Sorry, I encountered an error connecting to the 0G network." }]);
    }
    setLoading(false);
  };
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#a39185]/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-16 left-0 bottom-0 w-80 bg-[#e6d8cf] z-40 border-r border-[#a63c06]/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#d95c25] flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Insights Agent
            </h2>
            <button onClick={onClose} className="p-1 text-[#7a4b2c] hover:text-[#3d2314] md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
            {/* Mock/Live Chat Messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`rounded-lg p-3 text-sm shadow-sm border ${msg.role === 'user' ? 'bg-[#a63c06]/30 border-[#a63c06]/50 text-[#3d2314] ml-6' : 'bg-[#e6d8cf]/40 border-[#a63c06]/5 text-[#5c3a21] mr-6'}`}>
                <p className="text-xs text-[#d95c25] mb-1 font-semibold">{msg.role === 'user' ? 'You' : 'Agent'}</p>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-[#e6d8cf]/40 rounded-lg p-3 text-sm text-[#5c3a21] shadow-sm border border-[#a63c06]/5 w-16">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#d95c25] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#d95c25] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-[#d95c25] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-auto relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              placeholder="Ask about a market..." 
              className="w-full bg-[#e6d8cf]/40 border border-[#a63c06]/10 rounded-lg py-3 pl-4 pr-10 text-sm text-[#3d2314] placeholder-stone-500 focus:outline-none focus:border-[#d95c25]/50 transition-colors shadow-sm"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#d95c25] hover:bg-[#d95c25]/10 rounded-md transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
