"use client";

import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [platform, setPlatform] = useState<'kalshi' | 'polymarket'>('polymarket');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [customNewsSources, setCustomNewsSources] = useState('https://reuters.com/finance');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedPlatform = localStorage.getItem('active_platform');
      if (savedPlatform) setPlatform(savedPlatform as any);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem('active_platform', platform);
    
    const address = localStorage.getItem('connected_wallet');
    if (address) {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            platform,
            categories,
            tags,
            customNewsSources
          })
        });
      } catch (err) {
        console.error("Failed to save preferences:", err);
      }
    }
    
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#a39185]/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="glass w-full max-w-md rounded-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 shadow-xl border border-[#a63c06]/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d95c25] to-[#a63c06]" />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#3d2314]">Settings & Preferences</h2>
            <button onClick={onClose} className="text-[#7a4b2c] hover:text-[#3d2314] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div>
              <label className="block text-sm font-medium text-[#5c3a21] mb-2">Active Platform</label>
              <div className="flex bg-[#e6d8cf]/60 rounded-lg p-1 border border-[#a63c06]/10">
                <button 
                  onClick={() => setPlatform('kalshi')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${platform === 'kalshi' ? 'bg-white text-[#3d2314] shadow-sm' : 'text-[#7a4b2c] hover:text-[#3d2314]'}`}
                >
                  Kalshi
                </button>
                <button 
                  onClick={() => setPlatform('polymarket')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${platform === 'polymarket' ? 'bg-white text-[#3d2314] shadow-sm' : 'text-[#7a4b2c] hover:text-[#3d2314]'}`}
                >
                  Polymarket
                </button>
              </div>
              <p className="mt-1 text-xs text-[#7a4b2c]">This globally dictates which API is used for insights.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#5c3a21] mb-2">Categories (comma-separated)</label>
              <input 
                type="text"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                className="w-full bg-[#e6d8cf]/60 border border-[#a63c06]/10 rounded-lg p-3 text-sm text-[#3d2314] focus:outline-none focus:border-[#d95c25]/50 transition-colors"
                placeholder="Politics, Crypto, Macro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#5c3a21] mb-2">Tags (comma-separated)</label>
              <input 
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#e6d8cf]/60 border border-[#a63c06]/10 rounded-lg p-3 text-sm text-[#3d2314] focus:outline-none focus:border-[#d95c25]/50 transition-colors"
                placeholder="Elections, BTC, Interest Rates"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#5c3a21] mb-2">Custom News Sources</label>
              <textarea 
                value={customNewsSources}
                onChange={(e) => setCustomNewsSources(e.target.value)}
                className="w-full bg-[#e6d8cf]/60 border border-[#a63c06]/10 rounded-lg p-3 text-sm text-[#3d2314] focus:outline-none focus:border-[#d95c25]/50 transition-colors min-h-[80px]"
                placeholder="https://bloomberg.com/..."
              />
              <p className="mt-1 text-xs text-[#7a4b2c]">URLs used by Firecrawl for insights context.</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-[#d95c25]/20 to-[#a63c06]/20 hover:from-[#d95c25]/30 hover:to-[#a63c06]/30 text-[#3d2314] font-bold rounded-lg border border-[#a63c06]/10 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
