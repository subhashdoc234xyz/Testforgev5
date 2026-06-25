import React, { useState } from "react";
import { Critique, BuilderResponse, TestCase } from "../types";
import { AlertTriangle, HelpCircle, CheckCircle2, AlertOctagon, CornerDownRight, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

interface ReviewTrailProps {
  critiques: Critique[];
  responses: BuilderResponse[];
  testCases: TestCase[];
}

export default function ReviewTrail({ critiques, responses, testCases }: ReviewTrailProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (critiques.length === 0) {
    return (
      <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 mb-6 text-center text-sm text-emerald-300">
        ✨ <strong>Skeptic Agent Approval:</strong> Clean sweep! The Skeptic found zero gaps or omissions in the initial draft suite. No adversarial debate was triggered.
      </div>
    );
  }

  // Count metrics:
  const totalCount = critiques.length;
  const fixedCount = responses.filter((r) => r.action === "fixed").length;
  const defendedCount = responses.filter((r) => r.action === "rejected").length;

  // Sorting: Major severity first, then Minor
  const sortedCritiques = [...critiques].sort((a, b) => {
    if (a.severity === "major" && b.severity === "minor") return -1;
    if (a.severity === "minor" && b.severity === "major") return 1;
    return 0;
  });

  const getResponseForCritique = (critiqueId: string) => {
    return responses.find((r) => r.critiqueId === critiqueId);
  };

  const handleJumpToCard = (id: string | null) => {
    if (!id) return;
    const targetElement = document.getElementById(`tc-${id}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief flashing yellow outline trigger
      targetElement.classList.add("ring-2", "ring-emerald-400", "scale-[1.01]");
      setTimeout(() => {
        targetElement.classList.remove("ring-2", "ring-emerald-400", "scale-[1.01]");
      }, 1500);
    }
  };

  return (
    <div className="w-full bg-white/5 border border-white/12 rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase font-display">
              Adversarial Review Trail
            </h3>
          </div>
          
          {/* Badge counters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
              {totalCount} Issues Found
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
              {fixedCount} Resolved & Fixed
            </span>
            {defendedCount > 0 && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {defendedCount} Defended
              </span>
            )}
          </div>
        </div>

        <div className="text-gray-400 hover:text-white transition">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-5 space-y-4 border-t border-white/8 pt-5 animate-fade-in">
          <p className="text-xs text-gray-400 leading-relaxed mb-1">
            Below is the full diagnostic back-and-forth log. The <strong>Skeptic agent</strong> audited the requirement and draft, flagging vulnerabilities. The <strong>Builder agent</strong> then answered with either corrections or logical justifications.
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            {sortedCritiques.map((critique) => {
              const response = getResponseForCritique(critique.id);
              const isMajor = critique.severity === "major";

              return (
                <div
                  key={critique.id}
                  className="bg-black/25 rounded-xl border border-white/5 overflow-hidden transition hover:border-white/10"
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Critique description */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`flex items-center gap-1 text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded ${
                            isMajor
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-400/10 text-amber-300 border border-amber-500/15"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3 text-current shrink-0" />
                          {critique.severity} Gap
                        </span>

                        <span className="text-[10px] text-indigo-300 font-mono">
                          {critique.id}
                        </span>

                        {critique.targetTestCaseId ? (
                          <button
                            onClick={() => handleJumpToCard(critique.targetTestCaseId)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-mono"
                          >
                            Re: {critique.targetTestCaseId}
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-mono italic">
                            Missing Test Scenario Gap
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-gray-200">
                        {critique.issue}
                      </h4>
                      
                      <div className="text-xs text-gray-400 bg-white/5 border border-white/5 rounded-lg p-2.5">
                        <span className="font-bold text-[10px] block uppercase tracking-wider text-gray-500 mb-0.5">Skeptic Proposal:</span>
                        {critique.suggestedFix}
                      </div>
                    </div>

                    {/* Builder response defense code */}
                    <div className="md:col-span-5 bg-white/[0.02] rounded-xl p-3 border-l-2 md:border-l border-t md:border-t-0 md:border-white/5 flex flex-col justify-between gap-3">
                      {response ? (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {response.action === "fixed" ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Resolved & Updated
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  Defended / Rejected
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-300 leading-relaxed italic">
                              &ldquo;{response.explanation}&rdquo;
                            </p>
                          </div>

                          {response.action === "fixed" && response.updatedTestCase && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleJumpToCard(response.updatedTestCase?.id || critique.targetTestCaseId)}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                Jump to corrected card &rarr;
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-500 italic">
                          No explanation resolved
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
