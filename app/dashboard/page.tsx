"use client";

import { useEffect, useState } from "react";
import MarketCard from "@/components/MarketCard";
import ProfileWidget from "@/components/ProfileWidget";
import { MarketItem } from "@/lib/types";
import { AppConfig } from "@/morelikely.config";
import { mockMarkets } from "@/lib/mockData";

export default function DashboardPage() {
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchRecommendations = () => {
    setLoading(true);
    if (AppConfig.useMockData) {
      setTimeout(() => {
        setMarkets(mockMarkets);
        setLastRefreshed(new Date());
        setLoading(false);
      }, 500);
      return;
    }

    const address = localStorage.getItem('connected_wallet') || '';
    
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    })
      .then(res => res.json())
      .then(data => {
        if (data.recommendations) {
          setMarkets(data.recommendations);
          setLastRefreshed(new Date());
        }
      })
      .catch(err => console.error("Failed to load markets:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Determine indicator color: green if generated < 5 mins ago, red if older
  const isRecent = (new Date().getTime() - lastRefreshed.getTime()) < 5 * 60 * 1000;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      
      <ProfileWidget />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#3d2314] mb-2">Market Recommendations</h1>
          <p className="text-[#5c3a21]">Curated specifically for your portfolio and interests.</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {/* Status Notifier / Refresh Button */}
          <button 
            onClick={fetchRecommendations}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-colors border shadow-sm ${
              isRecent 
                ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 hover:bg-[#10b981]/20' 
                : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20 hover:bg-[#ef4444]/20'
            }`}
            title="Click to request a new recommendation list from the LLM"
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRecent ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}></div>
            {isRecent ? 'Live' : 'Stale (Refresh)'}
          </button>
          
          <button className="px-4 py-2 text-sm font-medium text-[#d95c25] bg-[#e6d8cf]/40 rounded-lg hover:bg-[#d95c25]/10 transition-colors border border-[#d95c25]/30">
            For You
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[#5c3a21] bg-[#e6d8cf]/40 rounded-lg hover:text-[#3d2314] transition-colors border border-[#a63c06]/5">
            High Liquidity
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[#5c3a21] bg-[#e6d8cf]/40 rounded-lg hover:text-[#3d2314] transition-colors flex items-center gap-2 border border-[#a63c06]/5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d95c25]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
