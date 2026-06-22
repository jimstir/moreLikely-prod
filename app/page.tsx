import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
      {/* Background glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a63c06]/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#d95c25]/30 bg-[#d95c25]/10 text-[#d95c25] text-sm font-semibold tracking-wide">
        Powered by 0G Inference Network
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#3d2314]">
        Predict the future with <br className="hidden md:block" />
        <span className="text-gradient">unmatched precision</span>
      </h1>
      
      <p className="text-lg md:text-xl text-[#5c3a21] max-w-2xl mb-12">
        moreLikely analyzes millions of data points and leverages cutting-edge LLMs to bring you the most accurate insights and personalized market recommendations from Kalshi and Polymarket.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/dashboard"
          className="px-8 py-4 rounded-xl font-bold text-[#3d2314] bg-gradient-to-r from-[#d95c25] to-[#a63c06] hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(166,60,6,0.3)]"
        >
          Launch App
        </Link>
        <button className="px-8 py-4 rounded-xl font-bold text-[#3d2314] glass hover:bg-[#e6d8cf]/50 transition-colors">
          Connect Wallet
        </button>
      </div>

      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[#a63c06]/10 pt-10 w-full max-w-4xl opacity-90">
        {[
          { label: "Total Volume", value: "$1.2B+" },
          { label: "Markets Analyzed", value: "50,000+" },
          { label: "Active Predictors", value: "10K+" },
          { label: "Inference Latency", value: "<400ms" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <h4 className="text-3xl font-bold text-[#3d2314] mb-2">{stat.value}</h4>
            <p className="text-sm text-[#7a4b2c] font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
