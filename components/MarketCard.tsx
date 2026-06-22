"use client";

import { useState } from "react";
import { MarketItem } from "@/lib/types";
import SimilarMarketsModal from "./SimilarMarketsModal";

interface MarketCardProps {
  market: MarketItem;
}

export default function MarketCard({ market }: MarketCardProps) {
  const [showDislikeOptions, setShowDislikeOptions] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const yesPercentage = Math.round(market.yesPrice * 100);
  const noPercentage = Math.round(market.noPrice * 100);

  const handleAction = async (action: 'click' | 'view' | 'like' | 'dislike' | 'bookmark', feedbackText?: string) => {
    const address = localStorage.getItem('connected_wallet') || 'anonymous';
    try {
      if (action === 'bookmark') {
        await fetch('/api/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, marketId: market.id, title: market.title, subtitle: market.subtitle, platform: market.platform })
        });
        return;
      }

      await fetch('/api/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, marketId: market.id, action, feedbackText })
      });
      
      if (action === 'click') {
        const url = market.platform === 'kalshi' 
          ? `https://kalshi.com/markets/${market.id}` 
          : `https://polymarket.com/event/${market.id}`;
        window.open(url, '_blank');
      }

      if (action === 'dislike' && feedbackText) {
        setShowDislikeOptions(false);
      }
    } catch (err) {
      console.error(`Failed to log ${action}:`, err);
    }
  };

  return (
    <>
    <div 
      onClick={() => handleAction('click')}
      className="glass bg-[#e6d8cf]/40 rounded-xl p-5 hover:border-[#d95c25]/40 transition-all duration-300 group cursor-pointer flex flex-col h-full hover:shadow-[0_0_30px_rgba(217,92,37,0.15)] relative"
    >
      <div className="mb-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-xs font-semibold text-[#d95c25] uppercase tracking-wider">{market.subtitle}</p>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleAction('bookmark'); }} className="text-[#5c3a21] hover:text-[#d95c25] transition-colors p-1" title="Bookmark market">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleAction('like'); }} className="text-[#5c3a21] hover:text-[#10b981] transition-colors p-1" title="Like this recommendation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" /></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowDislikeOptions(!showDislikeOptions); }} className="text-[#5c3a21] hover:text-[#ef4444] transition-colors p-1" title="Dislike this recommendation">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.514" /></svg>
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold text-[#3d2314] leading-tight mb-2 group-hover:text-[#d95c25] transition-colors">
          {market.title}
        </h3>
        <p className="text-sm text-[#5c3a21] line-clamp-2">
          {market.rationale}
        </p>
      </div>
      
      {showDislikeOptions && market.dislikeOptions && (
        <div className="absolute top-12 right-4 bg-white shadow-xl rounded-lg border border-stone-200 p-2 z-10 w-48 animate-in fade-in zoom-in-95">
          <p className="text-xs font-semibold text-stone-500 mb-2 px-2">Why dislike?</p>
          {market.dislikeOptions.map((opt, i) => (
            <button 
              key={i} 
              onClick={(e) => { e.stopPropagation(); handleAction('dislike', opt); }}
              className="w-full text-left px-2 py-1.5 text-xs text-[#3d2314] hover:bg-stone-100 rounded transition-colors"
            >
              {opt}
            </button>
          ))}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDislikeOptions(false); }}
            className="w-full text-center px-2 py-1 mt-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-[#a63c06]/10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-[#d95c25] font-medium tracking-wide">LIQUIDITY: ${(market.liquidity).toLocaleString()}</span>
          <button onClick={(e) => { e.stopPropagation(); setShowSimilar(true); }} className="text-xs text-[#7a4b2c] hover:text-[#d95c25] underline">Similar Markets</button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 bg-[#e6d8cf]/60 border border-[#10b981]/20 rounded-lg py-2 px-3 flex justify-between items-center shadow-sm">
            <span className="text-sm font-semibold text-[#5c3a21]">Yes</span>
            <span className="text-sm font-bold text-[#10b981]">{yesPercentage}%</span>
          </div>
          
          <div className="flex-1 bg-[#e6d8cf]/60 border border-[#ef4444]/20 rounded-lg py-2 px-3 flex justify-between items-center shadow-sm">
            <span className="text-sm font-semibold text-[#5c3a21]">No</span>
            <span className="text-sm font-bold text-[#ef4444]">{noPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
    
    {showSimilar && (
      <SimilarMarketsModal market={market} onClose={() => setShowSimilar(false)} />
    )}
    </>
  );
}
