import React from "react";
import { Sparkles, Play, ClipboardList } from "lucide-react";

interface InputPanelProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

const TEMPLATES = [
  {
    label: "🔐 Multi-factor Auth",
    text: "User login via password and Google Authenticator MFA. System must lock accounts out for 15 minutes after 5 continuous failed attempts. Enforce strict password rules: minimum 10 characters, at least one uppercase letter, one numeral, and one special character.",
  },
  {
    label: "🛒 E-commerce Checkout",
    text: "Checkout system supporting coupon codes and taxes. Coupon 'SHIPFREE' grants free shipping for subtotals over $50. Tax rate is 8.25% applied on cart subtotal minus discount. Cart items expire and release reserved inventory after 20 minutes of inactivity.",
  },
  {
    label: "📡 IoT Sync Offline Retry",
    text: "Smart wearable syncs body telemetry with server. If connection is lost, system retries 3 times with 5s exponential backoff. If all fail, data must persist in local IndexedDB storage and notify user with a yellow sync-pending icon.",
  },
];

export default function InputPanel({ value, onChange, onSubmit, loading }: InputPanelProps) {
  return (
    <div className="w-full bg-white/5 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-display">
          Describe System Requirements
        </h2>
      </div>

      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Pass in a features list, user stories, or a comprehensive spec. TestForge will spin up two adversarial AI agents to draft and review the corresponding test cases.
      </p>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TEMPLATES.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => !loading && onChange(tpl.text)}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-left bg-white/5 hover:bg-white/10 active:bg-white/15 text-gray-300 hover:text-white rounded-lg border border-white/8 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {tpl.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          placeholder="e.g. User should be able to upload profile image up to 5MB. Accepts PNG, JPG only, returns 400 Bad Request on larger or unapproved formatted images..."
          rows={5}
          className="w-full p-4 bg-black/30 text-sm text-gray-200 border border-white/8 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed resize-none disabled:opacity-60 disabled:cursor-not-allowed"
        />
        
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 font-mono">
          {value.length} chars
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={loading || value.trim().length < 8}
          className={`px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all duration-200 cursor-pointer select-none border border-indigo-400/20 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:scale-102`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing Debate Loop...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-violet-200" />
              Generate & Review Test Cases
            </>
          )}
        </button>
      </div>
    </div>
  );
}
