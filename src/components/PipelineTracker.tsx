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
    <div className="w-full bg-white/5 border border-white/12 rounded-2xl p-5 backdrop-blur-xl shadow-md transition-all duration-300">
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
                  {isActive && (
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-indigo-500/30 animate-ping" />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : isActive
                        ? "bg-indigo-600/20 border-indigo-400 text-indigo-400 font-bold"
                        : isFailed
                        ? "bg-rose-500/15 border-rose-500 text-rose-400"
                        : "bg-white/5 border-white/10 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isFailed ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : isActive ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span
                    className={`text-xs font-mono font-bold tracking-wide transition-colors duration-300 ${
                      isActive
                        ? "text-indigo-400"
                        : isCompleted
                        ? "text-emerald-400"
                        : isFailed
                        ? "text-rose-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-sm tracking-tight transition-colors duration-300 ${
                      isActive || isCompleted ? "text-white font-medium" : "text-gray-400"
                    }`}
                  >
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connector arrow */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block text-gray-700 text-lg select-none">→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {stage === "error" && errorMsg && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-sm text-rose-300 animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-xs font-medium rounded-lg border border-rose-500/40 transition active:scale-95 cursor-pointer"
            >
              Retry Step
            </button>
          )}
        </div>
      )}
    </div>
  );
}
