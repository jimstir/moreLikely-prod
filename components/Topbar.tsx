"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { AppConfig } from "@/morelikely.config";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
}

export default function Topbar({ onToggleSidebar, onOpenSettings }: TopbarProps) {
  const [address, setAddress] = useState<string>("");
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('connected_wallet');
    if (saved) setAddress(saved);
  }, []);

  const initiateConnection = () => {
    if (address) return; // already connected
    setShowOnboardModal(true);
  };

  const handleConnect = async (skipEmail: boolean) => {
    setShowOnboardModal(false);
    
    let userEmail = email;
    if (skipEmail) userEmail = "";

    if (AppConfig.useMockData) {
      const mockAddr = "0xMOCK_WALLET_ADDRESS";
      // Mock onboarding data
      if (!skipEmail && !userEmail) {
        userEmail = "mockuser@example.com";
      }
      setAddress(mockAddr);
      localStorage.setItem('connected_wallet', mockAddr);
      
      // Hit the new auth endpoint
      await fetch('/api/auth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: mockAddr, email: userEmail })
      }).catch(console.error);
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum as any);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        
        setAddress(addr);
        localStorage.setItem('connected_wallet', addr);
        
        // POST to new auth endpoint to register wallet & email
        await fetch('/api/auth/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: addr, email: userEmail })
        }).catch(console.error);
        
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 glass z-40 flex items-center justify-between px-6 border-b border-[#a63c06]/10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-[#e6d8cf]/50 transition-colors focus:outline-none"
            aria-label="Toggle AI Chat"
          >
            <svg className="w-6 h-6 text-[#d95c25]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <Link href="/" className="text-xl font-bold tracking-tight text-gradient">
            moreLikely
          </Link>
          <nav className="hidden md:flex ml-8 gap-6">
            <Link href="/dashboard" className="text-sm text-[#5c3a21] hover:text-[#3d2314] transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={initiateConnection}
            className="hidden sm:block px-4 py-2 rounded-full text-sm font-semibold bg-[#a63c06]/10 text-[#d95c25] border border-[#a63c06]/30 hover:bg-[#a63c06]/20 transition-all"
          >
            {address ? `${address.substring(0,6)}...${address.substring(address.length - 4)}` : "Connect Wallet"}
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-[#e6d8cf]/50 transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 text-[#5c3a21] hover:text-[#3d2314] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fdfaf6] border border-[#a63c06]/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-[#3d2314] mb-2">Welcome to moreLikely</h2>
            <p className="text-sm text-[#5c3a21] mb-6">
              Connect your wallet to get AI-curated prediction markets. We highly recommend adding your email to stay informed about future project updates.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#5c3a21] mb-1">Email Address (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-[#a63c06]/20 text-[#3d2314] focus:outline-none focus:border-[#d95c25]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleConnect(true)}
                className="flex-1 px-4 py-2 rounded-lg text-[#d95c25] border border-[#a63c06]/20 hover:bg-[#a63c06]/10 font-medium transition-colors"
              >
                Skip & Connect
              </button>
              <button 
                onClick={() => handleConnect(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#d95c25] text-white hover:bg-[#a63c06] font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
