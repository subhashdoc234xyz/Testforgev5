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
    <div className="w-full glass-card p-6 transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-[#0369a1]" />
            <h3 className="text-[11px] font-medium tracking-[0.1em] text-[#0369a1] uppercase">
              Adversarial Review Trail
            </h3>
          </div>
          
          {/* Badge counters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-medium bg-white/45 border border-[rgba(37,99,235,0.20)] text-[#1d4ed8] px-2 py-0.5 rounded-full">
              {totalCount} Issues Found
            </span>
            <span className="text-[10px] font-medium bg-[rgba(209,250,229,0.5)] border border-[#059669] text-[#065f46] px-2 py-0.5 rounded-full">
              {fixedCount} Resolved & Fixed
            </span>
          </div>
        </div>

        <div className="text-[#0369a1] hover:text-[#0c4a6e] transition">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-5 space-y-4 border-t border-[#0c4a6e]/10 pt-5">
          <p className="text-xs text-[#0369a1] leading-relaxed mb-1">
            Below is the full diagnostic back-and-forth log. The <strong>Skeptic agent</strong> audited the requirement and draft, flagging vulnerabilities. The <strong>Builder agent</strong> then answered with either corrections or logical justifications.
          </p>

          <div className="grid grid-cols-1 gap-[10px]">
            {sortedCritiques.map((critique) => {
              const response = getResponseForCritique(critique.id);
              const isMajor = critique.severity === "major";

              return (
                <div
                  key={critique.id}
                  className={`bg-white/40 rounded-[0_8px_8px_0] border border-white/5 overflow-hidden transition ${
                    isMajor ? "border-l-2 border-l-[#dc2626]" : "border-l-2 border-l-[#d97706]"
                  }`}
                >
                  <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Critique description */}
                    <div className="md:col-span-7 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`flex items-center gap-1 text-[10px] font-medium uppercase px-2 py-0.5 rounded-[4px] border ${
                            isMajor
                              ? "bg-[rgba(254,226,226,0.4)] text-[#dc2626] border-[#dc2626]"
                              : "bg-[rgba(254,243,199,0.4)] text-[#d97706] border-[#d97706]"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3 text-current shrink-0" />
                          {critique.severity} Gap
                        </span>

                        <span className="text-[10px] text-[#0369a1] font-mono">
                          {critique.id}
                        </span>

                        {critique.targetTestCaseId ? (
                          <button
                            onClick={() => handleJumpToCard(critique.targetTestCaseId)}
                            className="text-[10px] text-[#2563eb] hover:underline cursor-pointer font-mono"
                          >
                            Re: {critique.targetTestCaseId}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#d97706] font-mono italic">
                            Missing Test Scenario Gap
                          </span>
                        )}
                      </div>

                      <h4 className="text-[14px] font-medium text-[#0c4a6e]">
                        {critique.issue}
                      </h4>
                      
                      <div className="text-[14px] text-[#0369a1] bg-white/45 border border-white/75 rounded-lg p-2.5">
                        <span className="font-medium text-[11px] block uppercase tracking-wider text-[#0369a1] mb-0.5">Skeptic Proposal:</span>
                        {critique.suggestedFix}
                      </div>
                    </div>

                    {/* Builder response defense code */}
                    <div className="md:col-span-5 bg-white/20 rounded-xl p-3 border-l md:border-white/10 flex flex-col justify-between gap-3">
                      {response ? (
                        <>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {response.action === "fixed" ? (
                                <span className="flex items-center gap-1 text-[11px] text-[#065f46] font-medium bg-[rgba(209,250,229,0.5)] border border-[#059669] px-2 py-0.5 rounded-md">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Resolved & Updated
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] text-[#92400e] font-medium bg-[rgba(254,243,199,0.6)] border border-[#d97706] px-2 py-0.5 rounded-md">
                                  <HelpCircle className="w-3.5 h-3.5" />
                                  Defended / Rejected
                                </span>
                              )}
                            </div>

                            <p className="text-[14px] text-[#0c4a6e] leading-relaxed italic">
                              &ldquo;{response.explanation}&rdquo;
                            </p>
                          </div>

                          {response.action === "fixed" && response.updatedTestCase && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleJumpToCard(response.updatedTestCase?.id || critique.targetTestCaseId)}
                                className="text-[12px] text-[#2563eb] font-medium flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                Jump to corrected card &rarr;
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-[#0369a1] italic">
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
