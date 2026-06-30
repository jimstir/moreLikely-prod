"use client";

import { useState, useEffect } from "react";
import MarketCard from "./MarketCard";
import { MarketItem } from "@/lib/types";
import { resolveMarket } from "@/lib/marketResolver";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
}

export default function SearchModal({ isOpen, onClose, query }: SearchModalProps) {
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState<MarketItem | null>(null);
  const [localQuery, setLocalQuery] = useState(query);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMarketData = async (searchStr: string) => {
    if (!searchStr) return;
    setLoading(true);
    setMarket(null);
    setHasSearched(true);
    
    const result = await resolveMarket(searchStr);
    setMarket(result);
    setLoading(false);
  };

  // Trigger initial fetch if query prop changes
  useEffect(() => {
    if (isOpen && query) {
      setLocalQuery(query);
      fetchMarketData(query);
    }
  }, [isOpen, query]);

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketData(localQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#a39185]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-full max-w-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#f5ebe6] rounded-2xl overflow-hidden shadow-2xl border border-[#a63c06]/10">
          <div className="h-1 bg-gradient-to-r from-[#d95c25] to-[#a63c06]" />
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#3d2314]">Search Results</h2>
              <button onClick={onClose} className="p-2 bg-white rounded-full text-[#7a4b2c] hover:text-[#3d2314] hover:bg-gray-50 transition-colors shadow-sm border border-[#a63c06]/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleLocalSearch} className="mb-6">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Paste URL or Ticker..." 
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="w-full pl-4 pr-24 py-3 rounded-lg bg-white border border-[#a63c06]/20 text-[#3d2314] font-medium placeholder:text-[#a63c06]/40 focus:outline-none focus:ring-2 focus:ring-[#d95c25]/50 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={loading || !localQuery.trim()}
                  className="absolute right-2 px-4 py-1.5 rounded-md bg-[#d95c25] text-white font-bold text-sm shadow-md hover:bg-[#a63c06] transition-colors disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </form>
            
            <div className="min-h-[200px] flex flex-col justify-center">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d95c25] mb-4"></div>
                  <p className="text-[#5c3a21] font-medium">Fetching live market data...</p>
                </div>
              ) : market ? (
                <div className="animate-in fade-in duration-300">
                  <MarketCard market={market} />
                </div>
              ) : (
                hasSearched && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center">
                    <svg className="w-10 h-10 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h4 className="text-lg font-bold text-red-800 mb-2">Market Not Found</h4>
                    <p className="text-sm text-red-600 max-w-md">
                      We couldn't resolve a valid market from that URL or ticker. Please check your input and try searching again using the box above.
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
