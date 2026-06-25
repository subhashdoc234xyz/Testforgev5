import React from "react";
import { CheckCircle2, Circle, AlertCircle, RefreshCw } from "lucide-react";
import { PipelineStage } from "../types";

interface PipelineTrackerProps {
  stage: PipelineStage;
  errorMsg?: string;
  onRetry?: () => void;
}

export default function PipelineTracker({ stage, errorMsg, onRetry }: PipelineTrackerProps) {
  if (stage === "idle") return null;

  // Compute status for the three steps
  // Step 1: Drafting
  // Step 2: Gap Scanning (Skeptical Critique)
  // Step 3: Feedback Resolution (Adversarial Merge)
  const getStepStatus = (stepIdx: number) => {
    if (stage === "error" && errorMsg) {
      // If we are in an error state, we can flag where it crashed if we want,
      // but let's highlight the current stage with red.
      return "failed";
    }

    switch (stepIdx) {
      case 1:
        if (stage === "drafting") return "active";
        return "completed"; // as gaps, resolving, or complete implies drafting completed
      case 2:
        if (stage === "drafting") return "pending";
        if (stage === "gaps") return "active";
        return "completed"; // resolving, or complete implies gaps completed
      case 3:
        if (stage === "resolving") return "active";
        if (stage === "complete") return "completed";
        return "pending";
      default:
        return "pending";
    }
  };

  const steps = [
    {
      title: "Builder Agent",
      desc: "Drafting Initial Cases",
      status: getStepStatus(1),
    },
    {
      title: "Skeptic Agent",
      desc: "Spotting Gaps & Flaws",
      status: getStepStatus(2),
    },
    {
      title: "Resolution Phase",
      desc: "Debating & Refining",
      status: getStepStatus(3),
    },
  ];

  return (
    <div className="w-full glass-card p-5 transition-all duration-300">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6">
        {steps.map((step, idx) => {
          const isActive = step.status === "active";
          const isCompleted = step.status === "completed";
          const isFailed = step.status === "failed";

          return (
            <React.Fragment key={idx}>
              {/* Step item */}
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`relative w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#2563eb] text-white"
                        : isActive
                        ? "bg-white border-[1.5px] border-[#2563eb] text-[#2563eb] font-medium"
                        : isFailed
                        ? "bg-rose-500/15 border border-rose-500 text-rose-600"
                        : "bg-white border border-[#bfdbfe] text-[#93c5fd]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[11px]">{idx + 1}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-[11px] font-medium transition-colors duration-300 ${
                      isActive || isCompleted ? "text-[#0369a1]" : "text-[#93c5fd]"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[11px] tracking-tight transition-colors duration-300 ${
                      isActive || isCompleted ? "text-[#0369a1]" : "text-[#93c5fd]"
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connector arrow */}
              {idx < steps.length - 1 && (
                <div className={`hidden md:block w-8 h-[1px] ${isCompleted ? "bg-[#2563eb]" : "bg-[#bfdbfe]"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {stage === "error" && errorMsg && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-sm text-rose-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#dc2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-medium rounded-lg transition active:scale-95 cursor-pointer"
            >
              Retry Step
            </button>
          )}
        </div>
      )}
    </div>
  );
}
