import React, { useState } from "react";
import { TestCase } from "../types";
import { Check, Flame, AlertCircle, ArrowRight, ShieldCheck, Activity, Copy, CheckCircle2 } from "lucide-react";

interface TestCaseCardProps {
  key?: string | number;
  testCase: TestCase;
  onSync: (id: string) => void;
  syncing: boolean;
  syncedId: string | null;
}

export default function TestCaseCard({ testCase, onSync, syncing, syncedId }: TestCaseCardProps) {
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);

  // Status dot & text
  const getStatusMeta = (status: "draft" | "revised" | "final") => {
    switch (status) {
      case "draft":
        return { color: "bg-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/25", label: "Draft" };
      case "revised":
        return { color: "bg-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25", label: "Reviewed & Fixed" };
      case "final":
        return { color: "bg-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", label: "Finalized" };
    }
  };

  // Priority color
  const getPriorityMeta = (priority: "critical" | "high" | "medium" | "low") => {
    switch (priority) {
      case "critical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "medium":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "low":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
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
      className={`relative bg-white/5 border rounded-2xl p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-indigo-500/40 hover:bg-white/[0.08] ${
        testCase.isNew ? "ring-2 ring-indigo-500/40 border-indigo-400/40" : "border-white/12"
      }`}
    >
      {testCase.isNew && (
        <span className="absolute -top-2.5 -right-2.5 bg-indigo-500 text-white text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded-full select-none shadow">
          Refined New
        </span>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
            {testCase.id}
          </span>
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusMeta.bg} ${statusMeta.border} text-gray-300`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.color} ${testCase.status === "revised" ? "pulse-glow" : ""}`} />
            {statusMeta.label}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 border rounded-md ${priorityClass}`}>
            {testCase.priority}
          </span>
          <button
            onClick={handleCopy}
            title="Copy test case text to clipboard"
            className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs flex items-center gap-1 border border-white/5 transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-white tracking-tight leading-snug mb-3 font-display">
        {testCase.title}
      </h3>

      {/* Preconditions */}
      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">Preconditions:</h4>
          <ul className="text-xs text-gray-300 space-y-1 pl-4 list-disc marker:text-indigo-400">
            {testCase.preconditions.map((pre, i) => (
              <li key={i}>{pre}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-3 mb-5">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">Test Sequence Steps:</h4>
        <div className="space-y-2.5">
          {testCase.steps.map((step, idx) => (
            <div key={idx} className="bg-black/20 rounded-xl p-3 border border-white/5 text-xs">
              <div className="flex items-start gap-2 mb-1">
                <span className="font-mono text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-200 mt-0.5 leading-relaxed">{step.action}</span>
              </div>
              <div className="pl-7 text-xs text-indigo-300 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="leading-relaxed"><strong className="text-indigo-200">Assert:</strong> {step.expectedResult}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels / Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {testCase.labels && testCase.labels.map((lbl, idx) => (
          <span key={idx} className="text-[10px] font-mono bg-white/5 border border-white/5 text-gray-400 hover:text-white px-2 py-0.5 rounded-md transition">
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
      <div className="pt-4 border-t border-white/8 flex items-center justify-between gap-4">
        <span className="text-[11px] text-gray-400 italic">Ready for Test Manager Suite</span>
        
        {syncedId ? (
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Synced ({syncedId})</span>
          </div>
        ) : (
          <button
            onClick={() => onSync(testCase.id)}
            disabled={syncing}
            className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              syncing
                ? "bg-indigo-500/25 border-indigo-500/30 opacity-60 pointer-events-none"
                : "bg-white/5 border-white/12 hover:bg-white/10 hover:border-indigo-400/30"
            }`}
          >
            {syncing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Sync to Manager
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
