"use client";

import { useState } from "react";
import SearchModal from "./SearchModal";

export default function SearchWidget() {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsModalOpen(true);
  };

  return (
    <div className="glass bg-[#e6d8cf]/40 rounded-xl p-5 md:p-6 border border-[#a63c06]/10 mb-8 animate-in fade-in zoom-in-95 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#d95c25]/5 rounded-full blur-[60px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center text-center py-6">
        <h3 className="text-xl font-bold text-[#3d2314] mb-2">Find Specific Markets</h3>
        <p className="text-sm text-[#5c3a21] mb-6 max-w-lg">
          Paste a direct market URL (Kalshi / Polymarket) or enter a market ticker to instantly pull AI insights.
        </p>
        
        <form onSubmit={handleSearch} className="relative w-full max-w-3xl">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-[#7a4b2c]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            
            <input 
              type="text" 
              placeholder="e.g. $BTC, or https://polymarket.com/event/..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-xl bg-white/70 border border-[#a63c06]/20 text-[#3d2314] font-medium placeholder:text-[#a63c06]/40 focus:outline-none focus:ring-2 focus:ring-[#d95c25]/50 focus:border-[#d95c25]/50 transition-all shadow-sm"
            />
            
            <button 
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d95c25] to-[#a63c06] text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze
            </button>
          </div>
        </form>
      </div>

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        query={query} 
      />
    </div>
  );
}
