"use client";

import { useEffect, useState } from "react";
import { AppConfig } from "@/morelikely.config";

export default function ProfileWidget() {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string>("Unknown");
  const [stats, setStats] = useState({ totalClicks: 0, watchlisted: 0, totalInsights: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('connected_wallet');
    if (saved) setAddress(saved);
    else if (AppConfig.useMockData) setAddress('0xMOCK_WALLET_ADDRESS');

    // Network check
    if (typeof window !== 'undefined' && window.ethereum && !AppConfig.useMockData) {
      window.ethereum.request({ method: 'eth_chainId' })
        .then((chainId: string) => {
          if (chainId === '0x4115') setNetwork('0G Mainnet');
          else if (chainId === '0x1') setNetwork('Ethereum');
          else if (chainId === '0x89') setNetwork('Polygon');
          else setNetwork(`Chain ${parseInt(chainId, 16)}`);
        })
        .catch(console.error);
    } else if (AppConfig.useMockData) {
      setNetwork('Mock Network (Offline)');
    }

  }, []);

  useEffect(() => {
    if (address) {
      fetch(`/api/profile/stats?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats);
          }
        })
        .catch(console.error);
    }
  }, [address]);

  if (!address) return null;

  return (
    <div className="glass bg-[#e6d8cf]/40 rounded-xl p-5 border border-[#a63c06]/10 mb-8 animate-in fade-in zoom-in-95">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-[#3d2314]">Profile Overview</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#5c3a21]">Network:</span>
          <span className={`px-2 py-1 text-xs font-bold border rounded-md ${
            AppConfig.useMockData 
              ? 'bg-[#e6d8cf]/60 text-[#7a4b2c] border-[#a63c06]/20' 
              : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20'
          }`}>
            {network}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/40 p-4 rounded-lg border border-[#a63c06]/5">
          <p className="text-xs text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Total Market Clicks</p>
          <p className="text-2xl font-bold text-[#d95c25]">{stats.totalClicks}</p>
        </div>
        <div className="bg-white/40 p-4 rounded-lg border border-[#a63c06]/5">
          <p className="text-xs text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Saved / Watchlisted</p>
          <p className="text-2xl font-bold text-[#10b981]">{stats.watchlisted}</p>
        </div>
        <div className="bg-white/40 p-4 rounded-lg border border-[#a63c06]/5">
          <p className="text-xs text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Insights Requested</p>
          <p className="text-2xl font-bold text-[#3d2314]">{stats.totalInsights}</p>
        </div>
      </div>
    </div>
  );
}
