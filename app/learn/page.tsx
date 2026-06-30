import Link from "next/link";

export default function LearnMorePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pb-32">
      <div className="mb-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#5c3a21] hover:text-[#d95c25] transition-all font-semibold bg-white/40 hover:bg-white/80 px-4 py-2.5 rounded-xl border border-[#a63c06]/10 shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Background glowing elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d95c25]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#a63c06]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="text-center mb-20 relative">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-[#d95c25]/30 bg-[#d95c25]/10 text-[#d95c25] text-sm font-semibold tracking-wide">
          moreLikely Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-[#3d2314]">
          Smarter Predictions, <span className="text-gradient">Better Alpha.</span>
        </h1>
        <p className="text-lg text-[#5c3a21] max-w-2xl mx-auto">
          Leverage the power of cutting-edge LLMs and decentralized inference to discover personalized market insights and trading opportunities.
        </p>
      </div>

      <div className="mb-24">
        <h2 className="text-3xl font-bold text-center text-[#3d2314] mb-12">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <div className="glass p-8 rounded-3xl border border-[#a63c06]/10 hover:border-[#d95c25]/30 transition-all shadow-lg flex flex-col h-full">
            <h3 className="text-2xl font-bold text-[#3d2314] mb-2">Basic</h3>
            <p className="text-[#5c3a21] mb-6">Perfect for getting started with prediction markets.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-[#3d2314]">Free</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Browse all supported markets", "Connect Web3 wallet seamlessly", "Basic market search", "Standard latency"].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#d95c25] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[#5c3a21]">{feature}</span>
                </li>
              ))}
            </ul>
            <Link 
              href="/dashboard"
              className="w-full block text-center px-6 py-4 rounded-xl font-bold text-[#d95c25] bg-[#a63c06]/10 hover:bg-[#a63c06]/20 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="glass p-8 rounded-3xl border-2 border-[#d95c25]/40 hover:border-[#d95c25] transition-all shadow-xl shadow-[#d95c25]/10 relative flex flex-col h-full overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#d95c25] to-[#a63c06] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
              Recommended
            </div>
            <h3 className="text-2xl font-bold text-[#3d2314] mb-2">Premium AI</h3>
            <p className="text-[#5c3a21] mb-6">Unlock personalized LLM insights and automated curations.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-[#3d2314]">Custom</span>
              <span className="text-[#7a4b2c] font-medium ml-2">/ month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Everything in Basic", 
                "Full access to AI-curated Recommendations", 
                "Deep Semantic Matching for your wallet", 
                "Powered by Google Gemini / 0G Network",
                "Priority on-chain indexing"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#d95c25] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[#5c3a21] font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <button className="w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#d95c25] to-[#a63c06] hover:opacity-90 transition-opacity shadow-md">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-10 border-t border-[#a63c06]/10">
        <h2 className="text-3xl font-bold text-center text-[#3d2314] mb-10">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            {
              q: "How does the AI personalization work?",
              a: "We analyze your past wallet activity, connected accounts, and specific preferences to query an advanced LLM. This model filters thousands of prediction markets to surface the exact opportunities most relevant to your interests and expertise."
            },
            {
              q: "Do I need crypto to use the platform?",
              a: "You can browse and explore the platform for free using a Web3 wallet. However, placing actual predictions or upgrading to Premium requires native tokens (like ETH, MATIC, or USDC) on the respective networks."
            },
            {
              q: "Which networks are supported?",
              a: "We currently support Ethereum Mainnet, Polygon, and the 0G Mainnet. You can seamlessly switch between these directly in the Wallet Modal."
            },
            {
              q: "Is my wallet data secure?",
              a: "Absolutely. We only index public on-chain data associated with your wallet address. Our AI processing strictly adheres to local privacy constraints and does not ingest or share Personally Identifiable Information (PII)."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-[#a63c06]/5">
              <h4 className="text-lg font-bold text-[#3d2314] mb-2">{faq.q}</h4>
              <p className="text-[#5c3a21] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
