"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, formatEther } from "ethers";
import { AppConfig } from "@/morelikely.config";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  onInitiateConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletModal({ isOpen, onClose, address, onInitiateConnect, onDisconnect }: WalletModalProps) {
  const [network, setNetwork] = useState<string>("Unknown Network");
  const [symbol, setSymbol] = useState<string>("ETH");
  const [balance, setBalance] = useState<string>("0.0");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ totalClicks: 0, watchlisted: 0, totalInsights: 0 });

  const fetchData = useCallback(() => {
    if (!isOpen || !address) return;
    
    if (AppConfig.useMockData) {
      setNetwork("Mock Network");
      setSymbol("MOCK");
      setBalance("1.25");
      setStats({ totalClicks: 42, watchlisted: 12, totalInsights: 5 });
      return;
    }

    // Fetch Stats
    fetch(`/api/profile/stats?address=${address}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error);

    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum as any);
      
      provider.getNetwork().then(net => {
        let netName = net.name && net.name !== "unknown" ? net.name : `Chain ${net.chainId}`;
        let netSymbol = "ETH";
        
        if (net.chainId === 1025n) { netName = "0G Mainnet"; netSymbol = "A0GI"; }
        else if (net.chainId === 1n) { netName = "Ethereum Mainnet"; netSymbol = "ETH"; }
        else if (net.chainId === 137n) { netName = "Polygon"; netSymbol = "MATIC"; }
        else if (net.chainId === 42161n) { netName = "Arbitrum One"; netSymbol = "ETH"; }
        else if (net.chainId === 10n) { netName = "Optimism"; netSymbol = "ETH"; }
        else if (net.chainId === 8453n) { netName = "Base"; netSymbol = "ETH"; }
        else if (net.chainId === 56n) { netName = "BNB Smart Chain"; netSymbol = "BNB"; }
        else if (net.chainId === 43114n) { netName = "Avalanche C-Chain"; netSymbol = "AVAX"; }
        
        if (netName === net.name) {
          netName = netName.charAt(0).toUpperCase() + netName.slice(1);
        }

        setNetwork(netName);
        setSymbol(netSymbol);
      }).catch(console.error);

      provider.getBalance(address).then(bal => {
        setBalance(parseFloat(formatEther(bal)).toFixed(4));
      }).catch(console.error);
    }
  }, [isOpen, address]);

  useEffect(() => {
    fetchData();

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', fetchData);
      window.ethereum.on('accountsChanged', fetchData);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('chainChanged', fetchData);
        window.ethereum.removeListener('accountsChanged', fetchData);
      }
    };
  }, [fetchData]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#a39185]/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="glass w-full max-w-md rounded-2xl relative overflow-visible animate-in fade-in zoom-in-95 duration-200 shadow-xl border border-[#a63c06]/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d95c25] to-[#a63c06]" />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#3d2314]">
              {address ? "Your Profile" : "Connect Wallet"}
            </h2>
            <button onClick={onClose} className="text-[#7a4b2c] hover:text-[#3d2314] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {!address ? (
            <div className="space-y-4">
              <p className="text-sm text-[#5c3a21] mb-4">
                Connect your wallet to predict on markets and receive personalized insights.
              </p>
              <button 
                onClick={() => { onClose(); onInitiateConnect(); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#d95c25] to-[#a63c06] text-white font-bold hover:opacity-90 transition-opacity shadow-md"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.1 6.5C21.1 6.5 19.3 4.2 18.2 3.6C17.1 3 14.5 2.7 14.5 2.7L13.7 4C16.3 4.8 17.6 6.3 17.6 6.3C17.6 6.3 16.5 5.6 15 5.1C13.5 4.6 12 4.6 12 4.6C12 4.6 10.5 4.6 9 5.1C7.5 5.6 6.4 6.3 6.4 6.3C6.4 6.3 7.7 4.8 10.3 4L9.5 2.7C9.5 2.7 6.9 3 5.8 3.6C4.7 4.2 2.9 6.5 2.9 6.5C2.9 6.5 0.5 11.2 0 17C0 17 2.3 21 6.8 21.2C6.8 21.2 7.8 19.9 8.3 19.1C7.1 18.7 6.3 18.1 6.3 18.1C6.3 18.1 6.6 17.9 6.8 17.7C8.7 18.9 10.5 19.3 12 19.3C13.5 19.3 15.3 18.9 17.2 17.7C17.4 17.9 17.7 18.1 17.7 18.1C17.7 18.1 16.9 18.7 15.7 19.1C16.2 19.9 17.2 21.2 17.2 21.2C21.7 21 24 17 24 17C23.5 11.2 21.1 6.5 21.1 6.5ZM8.5 15.3C7.5 15.3 6.6 14.3 6.6 13.1C6.6 11.9 7.4 10.9 8.5 10.9C9.6 10.9 10.5 11.9 10.4 13.1C10.4 14.3 9.6 15.3 8.5 15.3ZM15.5 15.3C14.5 15.3 13.6 14.3 13.6 13.1C13.6 11.9 14.4 10.9 15.5 10.9C16.6 10.9 17.5 11.9 17.4 13.1C17.5 14.3 16.6 15.3 15.5 15.3Z"/>
                </svg>
                Connect with MetaMask
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#e6d8cf]/60 rounded-xl p-4 border border-[#a63c06]/10">
                <p className="text-xs text-[#7a4b2c] font-semibold uppercase tracking-wider mb-1">Wallet Address</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[#3d2314] text-sm break-all pr-2">
                    {address}
                  </p>
                  <button 
                    onClick={handleCopy}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-[#a63c06]/10 transition-colors"
                  >
                    {copied ? (
                      <span className="text-xs font-bold text-green-600">Copied!</span>
                    ) : (
                      <svg className="w-4 h-4 text-[#5c3a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#e6d8cf]/40 rounded-xl p-4 border border-[#a63c06]/5 relative">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-[#7a4b2c] font-semibold uppercase tracking-wider">Network</p>
                  </div>
                  <p className="font-bold text-[#3d2314] truncate pr-2">{network}</p>
                </div>
                
                <div className="bg-[#e6d8cf]/40 rounded-xl p-4 border border-[#a63c06]/5">
                  <p className="text-xs text-[#7a4b2c] font-semibold uppercase tracking-wider mb-1">Balance</p>
                  <p className="font-bold text-[#10b981]">{balance} {symbol}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#e6d8cf]/40 p-3 rounded-xl border border-[#a63c06]/5 text-center">
                  <p className="text-[10px] text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Total Clicks</p>
                  <p className="text-xl font-bold text-[#d95c25]">{stats.totalClicks}</p>
                </div>
                <div className="bg-[#e6d8cf]/40 p-3 rounded-xl border border-[#a63c06]/5 text-center">
                  <p className="text-[10px] text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Saved</p>
                  <p className="text-xl font-bold text-[#10b981]">{stats.watchlisted}</p>
                </div>
                <div className="bg-[#e6d8cf]/40 p-3 rounded-xl border border-[#a63c06]/5 text-center">
                  <p className="text-[10px] text-[#5c3a21] uppercase tracking-wider font-semibold mb-1">Insights</p>
                  <p className="text-xl font-bold text-[#3d2314]">{stats.totalInsights}</p>
                </div>
              </div>

              <button  
                onClick={() => { onDisconnect(); onClose(); }}
                className="w-full flex justify-center py-3 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors border border-red-100"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
