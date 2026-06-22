"use client";

import { useEffect, useState } from "react";
import { MarketItem } from "@/lib/types";

interface SimilarMarketsModalProps {
  market: MarketItem;
  onClose: () => void;
}

export default function SimilarMarketsModal({ market, onClose }: SimilarMarketsModalProps) {
  const [similarMarkets, setSimilarMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/markets/similar?marketId=${market.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.similar) {
          setSimilarMarkets(data.similar);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [market.id]);

  const handleGenerateMatch = async () => {
    setLoading(true);
    try {
      await fetch('/api/markets/semantic-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketA: market, marketB: { id: "mock_random", title: "Placeholder for semantic search", category: market.category } })
      });
      // In a real implementation we would fetch the newly discovered matches again
      alert("Semantic match requested! A background worker will process the match if successful.");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#a39185]/70 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onClose(); }} />
      
      <div className="glass w-full max-w-2xl rounded-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-xl border border-[#a63c06]/10 z-10 bg-white" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d95c25] to-[#a63c06]" />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#3d2314]">Similar Markets</h2>
              <p className="text-xs text-stone-500 mt-1">Experimental Feature: AI-powered market relationship discovery.</p>
            </div>
            <button onClick={onClose} className="text-[#7a4b2c] hover:text-[#3d2314] transition-colors p-1 bg-stone-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mb-4 p-4 bg-[#e6d8cf]/40 rounded-lg border border-[#a63c06]/10">
            <p className="text-xs font-semibold text-[#d95c25] uppercase tracking-wider mb-1">Target Market</p>
            <p className="text-[#3d2314] font-medium">{market.title}</p>
          </div>
          
          {loading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d95c25]"></div>
            </div>
          ) : similarMarkets.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {similarMarkets.map(sm => (
                <div key={sm.id} className="p-4 border border-stone-200 rounded-lg">
                  <p className="text-sm font-semibold text-[#3d2314]">{sm.marketBId === market.id ? sm.marketAId : sm.marketBId}</p>
                  <p className="text-xs text-stone-600 mt-2"><span className="font-semibold">Rationale:</span> {sm.rationale}</p>
                  <p className="text-xs text-[#d95c25] mt-1 font-semibold">Confidence: {Math.round(sm.confidence * 100)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-stone-300 rounded-lg bg-stone-50">
              <p className="text-sm text-stone-500">No cached similar markets found.</p>
              <button 
                onClick={handleGenerateMatch}
                className="mt-4 px-4 py-2 bg-[#e6d8cf] text-[#3d2314] hover:bg-[#d95c25]/20 text-sm font-semibold rounded-lg transition-colors border border-[#a63c06]/10"
              >
                Generate Semantic Match (On-Demand)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
