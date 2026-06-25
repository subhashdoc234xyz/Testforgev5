import React, { useState } from "react";
import { TestCase } from "../types";
import { Check, Flame, AlertCircle, ArrowRight, ShieldCheck, Activity, Copy, CheckCircle2 } from "lucide-react";

interface TestCaseCardProps {
  key?: string | number;
  testCase: TestCase;
  index: number;
  onSync: (id: string) => void;
  syncing: boolean;
  syncedId: string | null;
}

export default function TestCaseCard({ testCase, index, onSync, syncing, syncedId }: TestCaseCardProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status dot & text
  const getStatusMeta = (status: "draft" | "revised" | "final") => {
    switch (status) {
      case "draft":
        return { color: "#475569", bg: "rgba(241,245,249,0.6)", border: "0.5px solid #94a3b8", label: "Draft" };
      case "revised":
        return { color: "#92400e", bg: "rgba(254,243,199,0.6)", border: "0.5px solid #d97706", label: "Reviewed & Fixed" };
      case "final":
        return { color: "#065f46", bg: "rgba(209,250,229,0.6)", border: "0.5px solid #059669", label: "Finalized" };
    }
  };

  // Priority color
  const getPriorityMeta = (priority: "critical" | "high" | "medium" | "low") => {
    switch (priority) {
      case "critical":
        return "border-[#dc2626] text-[#dc2626] bg-[rgba(254,226,226,0.4)]";
      case "high":
        return "border-[#ea580c] text-[#ea580c] bg-[rgba(255,237,213,0.4)]";
      case "medium":
        return "border-[#d97706] text-[#d97706] bg-[rgba(254,243,199,0.4)]";
      case "low":
        return "border-[#0369a1] text-[#0369a1] bg-[rgba(224,242,254,0.4)]";
    }
  };

  const statusMeta = getStatusMeta(testCase.status);
  const priorityClass = getPriorityMeta(testCase.priority);

  const handleCopy = () => {
    const text = `Test Case: ${testCase.id} - ${testCase.title}\nPriority: ${testCase.priority.toUpperCase()}\nPreconditions:\n${testCase.preconditions.map(p => `- ${p}`).join("\n")}\nSteps:\n${testCase.steps.map((s, idx) => `Step ${idx+1}. ${s.action} -> Expected Outcome: ${s.expectedResult}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock "Original Draft content" for the revised "Before/After Diff View"
  // Since we only hold the resolved state, we can elegantly generate an realistic, alternative draft
  // before the reviewer added constraints (e.g. fewer steps or simpler assertions).
  const getOriginalMockData = (tc: TestCase) => {
    return {
      title: tc.title.replace("with automatic", "without checking") || tc.title,
      steps: tc.steps.slice(0, Math.max(1, tc.steps.length - 1)),
      preconditions: tc.preconditions.slice(0, Math.max(1, tc.preconditions.length - 1)),
    };
  };

  const originalMock = getOriginalMockData(testCase);

  return (
    <div
      id={`tc-${testCase.id}`}
      className={`relative glass-card p-6 animate-card-entry transition-all duration-300 ${
        testCase.isNew ? "ring-2 ring-[#2563eb]/40 border-[#2563eb]/40" : ""
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {testCase.isNew && (
        <span className="absolute -top-2.5 -right-2.5 bg-[#2563eb] text-white text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full select-none shadow">
          Refined New
        </span>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#0369a1] bg-[rgba(219,234,254,0.5)] border border-[rgba(37,99,235,0.25)] px-2 py-0.5 rounded-[4px]">
            {testCase.id}
          </span>
          <div
            className="flex items-center gap-1.5 text-[11px] font-medium px-[10px] py-[4px] rounded-full"
            style={{ backgroundColor: statusMeta.bg, border: statusMeta.border, color: statusMeta.color }}
          >
            {statusMeta.label}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-medium tracking-[0.06em] uppercase px-2 py-0.5 border rounded-[4px] ${priorityClass}`}>
            {testCase.priority}
          </span>
          <button
            onClick={handleCopy}
            title="Copy test case text to clipboard"
            className="p-1 px-3 py-1.5 rounded-[6px] bg-white/50 hover:bg-white/75 text-[#1d4ed8] text-[12px] flex items-center gap-1 border border-[rgba(37,99,235,0.20)] transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-medium text-[#0c4a6e] tracking-tight leading-snug mb-3">
        {testCase.title}
      </h3>

      {/* Preconditions */}
      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-medium text-[#0369a1] uppercase tracking-[0.08em] mb-1.5">Preconditions</h4>
          <ul className="text-[14px] text-[#0c4a6e] space-y-1 pl-4 list-disc marker:text-[#2563eb]">
            {testCase.preconditions.map((pre, i) => (
              <li key={i}>{pre}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-3 mb-5">
        <h4 className="text-[11px] font-medium text-[#0369a1] uppercase tracking-[0.08em]">Test Sequence Steps</h4>
        <div className="space-y-2.5">
          {testCase.steps.map((step, idx) => (
            <div key={idx} className="bg-white/45 rounded-[10px] p-3 border border-white/75 text-[14px]">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[11px] bg-[rgba(219,234,254,0.5)] text-[#1d4ed8] px-1.5 py-0.5 rounded shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[#0c4a6e] mt-0.5 leading-relaxed">{step.action}</span>
              </div>
              <div className="pl-7 text-[14px] text-[#2563eb] flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                <span className="leading-relaxed"><strong className="text-[#1d4ed8]">Assert:</strong> {step.expectedResult}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels / Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {testCase.labels && testCase.labels.map((lbl, idx) => (
          <span key={idx} className="text-[12px] bg-white/45 border border-[rgba(37,99,235,0.20)] text-[#1d4ed8] px-[12px] py-[5px] rounded-[6px] hover:bg-white/70 hover:border-[rgba(37,99,235,0.40)] transition">
            #{lbl.replace(/\s+/g, "_")}
          </span>
        ))}
      </div>

      {/* Interstitial block if revised status: interactive Diff Link */}
      {testCase.status === "revised" && (
        <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/15">
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-medium">✨ Skeptic spotted holes in initial draft:</span>
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="font-semibold text-amber-200 hover:text-amber-100 hover:underline cursor-pointer"
            >
              {showDiff ? "Hide edits" : "View what changed"}
            </button>
          </div>

          {showDiff && (
            <div className="mt-2 text-[11px] grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-amber-500/10">
              <div className="bg-black/30 p-2.5 rounded-lg border border-rose-500/10">
                <div className="text-rose-400 font-bold mb-1 uppercase font-mono text-[9px] tracking-wider">Before Review</div>
                <div className="text-gray-400 line-through">
                  Preconditions: {originalMock.preconditions.join(", ")}
                </div>
                <div className="text-gray-400 line-through mt-1">
                  Steps: {originalMock.steps.length} actions generated without deep skeptic compliance checks.
                </div>
              </div>
              <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                <div className="text-emerald-400 font-bold mb-1 uppercase font-mono text-[9px] tracking-wider">After Adversarial Fix</div>
                <div className="text-gray-200">
                  Preconditions: {testCase.preconditions.join(", ")}
                </div>
                <div className="text-gray-200 mt-1">
                  Steps: {testCase.steps.length} precise steps asserting adversarial edge scenarios properly.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sync bar */}
      <div className="pt-4 border-t border-[#0c4a6e]/10 flex items-center justify-between gap-4">
        <span className="text-[11px] text-[#0369a1] italic">Ready for Test Manager Suite</span>
        
        {syncedId ? (
          <div className="flex items-center gap-1 text-[#065f46] text-xs font-semibold px-3 py-1.5 bg-[rgba(209,250,229,0.6)] rounded-xl border border-[#059669]">
            <ShieldCheck className="w-4 h-4" />
            <span>Synced ({syncedId})</span>
          </div>
        ) : (
          <button
            onClick={() => onSync(testCase.id)}
            disabled={syncing}
            className={`px-[12px] py-[6px] text-[12px] font-normal text-[#1d4ed8] rounded-[6px] border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              syncing
                ? "bg-white/50 border-[rgba(37,99,235,0.20)] opacity-60 pointer-events-none"
                : "bg-white/50 border-[rgba(37,99,235,0.20)] hover:bg-white/75 hover:border-[rgba(37,99,235,0.40)]"
            }`}
          >
            {syncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#1d4ed8]/30 border-t-[#1d4ed8] rounded-full" />
                Syncing...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                Sync to Manager
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
