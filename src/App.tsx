import React, { useState } from "react";
import { TestCase, Critique, BuilderResponse, PipelineProgress, PipelineStage } from "./types";
import InputPanel from "./components/InputPanel";
import PipelineTracker from "./components/PipelineTracker";
import TestCaseCard from "./components/TestCaseCard";
import ReviewTrail from "./components/ReviewTrail";
import { 
  ShieldAlert, 
  Layers, 
  Upload, 
  RotateCw, 
  HelpCircle, 
  Sparkles, 
  Check, 
  Activity, 
  ListRestart, 
  Search, 
  MessageSquareDiff, 
  FolderSync 
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ForgotPassword from "./components/auth/ForgotPassword";
import UserMenu from "./components/auth/UserMenu";

export default function App() {
  const { currentUser, idToken } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login");

  const [requirement, setRequirement] = useState("");
  const [refinementText, setRefinementText] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [critiques, setCritiques] = useState<Critique[]>([]);
  const [responses, setResponses] = useState<BuilderResponse[]>([]);
  
  // Progress tracking
  const [progress, setProgress] = useState<PipelineProgress>({ stage: "idle" });

  // Sync state tracking
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, string>>({}); // testCaseId -> remoteId map
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({}); // testCaseId -> loadState
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Draft cache used to resume step-by-step if error occurs
  const [cachedDrafts, setCachedDrafts] = useState<TestCase[]>([]);
  const [cachedCritiques, setCachedCritiques] = useState<Critique[]>([]);

  // Get request headers with Authorization token if available
  const getHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  };

  // Show a message toast
  const triggerToast = (text: string, type: "success" | "info" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };


  // Run the full sequential client-friendly pipeline with beautiful stage updates
  const runFullPipeline = async (inputReq: string, refInstruction?: string, existingCases?: TestCase[]) => {
    if (!inputReq || inputReq.trim() === "") return;

    setProgress({ stage: "drafting", stepName: "Stage 1: Builder drafting test cases" });
    setTestCases([]);
    setCritiques([]);
    setResponses([]);

    try {
      // Step 1: Drafting
      const draftRes = await fetch("/api/generate-step", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          step: "drafting",
          requirement: inputReq,
          refinementInstruction: refInstruction,
          previousTestCases: existingCases,
        }),
      });

      if (!draftRes.ok) {
        const errData = await draftRes.json();
        throw new Error(errData.error || "Failed to generate initial draft test cases.");
      }

      const draftData = await draftRes.json();
      const drafts = draftData.draftTestCases || [];
      setCachedDrafts(drafts);

      // Step 2: Critique
      setProgress({ stage: "gaps", stepName: "Stage 2: Skeptic scanning constraints for gaps" });
      const critiqueRes = await fetch("/api/generate-step", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          step: "critique",
          requirement: inputReq,
          draftTestCases: drafts,
        }),
      });

      if (!critiqueRes.ok) {
        const errData = await critiqueRes.json();
        throw new Error(errData.error || "Failed while scanning for requirements gaps.");
      }

      const critiqueData = await critiqueRes.json();
      const crits = critiqueData.critiques || [];
      setCachedCritiques(crits);

      // If no critiques found or empty, finalize drafts and skip to complete
      if (crits.length === 0) {
        const finalized = drafts.map((tc: any) => ({ ...tc, status: "final" as const }));
        setTestCases(finalized);
        setProgress({ stage: "complete" });
        triggerToast("Test suite generated perfectly! No issues found.");
        return;
      }

      // Step 3: Resolving (Builder Response)
      setProgress({ stage: "resolving", stepName: "Stage 3: Builder debating skepticism and updating suite" });
      const builderRespRes = await fetch("/api/generate-step", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          step: "response",
          requirement: inputReq,
          draftTestCases: drafts,
          critiques: crits,
        }),
      });

      if (!builderRespRes.ok) {
        const errData = await builderRespRes.json();
        throw new Error(errData.error || "Failed representing Builder defenses & resolves.");
      }

      const builderRespData = await builderRespRes.json();
      const resps = builderRespData.responses || [];
      const mergedCases = builderRespData.testCases || [];

      // Highlight new/revised test cases in case of refinement pass
      let finalizedCases = mergedCases;
      if (refInstruction && existingCases) {
        const prevIds = new Set(existingCases.map(c => c.id));
        finalizedCases = mergedCases.map((tc: TestCase) => {
          if (!prevIds.has(tc.id) || tc.status === "revised") {
            return { ...tc, isNew: true };
          }
          return tc;
        });
      }

      setTestCases(finalizedCases);
      setCritiques(crits);
      setResponses(resps);
      setProgress({ stage: "complete" });
      triggerToast(
        `Adversarial loop complete! Spun ${crits.length} review points: ${resps.filter((r: any) => r.action === "fixed").length} corrected.`,
        "success"
      );

    } catch (err) {
      console.error(err);
      setProgress({
        stage: "error",
        errorMsg: (err as Error).message || "An unexpected error disrupted the pipeline session.",
      });
    }
  };

  // Resuming step by step on failure
  const handleStepRetry = async () => {
    const currentStage = progress.stage;
    setProgress({ stage: currentStage, stepName: "Retrying previous failed action..." });

    try {
      if (currentStage === "drafting" || testCases.length === 0 && cachedDrafts.length === 0) {
        await runFullPipeline(requirement);
        return;
      }

      if (currentStage === "gaps" || cachedDrafts.length > 0 && cachedCritiques.length === 0) {
        setProgress({ stage: "gaps", stepName: "Retrying Stage 2: Skeptic scanning" });
        const res = await fetch("/api/generate-step", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            step: "critique",
            requirement,
            draftTestCases: cachedDrafts,
          }),
        });

        if (!res.ok) throw new Error("Retry of Skeptic gap scanning failed.");
        const data = await res.json();
        const crits = data.critiques || [];
        setCachedCritiques(crits);

        if (crits.length === 0) {
          setTestCases(cachedDrafts.map(tc => ({ ...tc, status: "final" })));
          setProgress({ stage: "complete" });
          return;
        }

        // Proceed to resolve
        setProgress({ stage: "resolving", stepName: "Proceeding to Stage 3: Resolving" });
        const respRes = await fetch("/api/generate-step", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            step: "response",
            requirement,
            draftTestCases: cachedDrafts,
            critiques: crits,
          }),
        });

        if (!respRes.ok) throw new Error("Retry of Builder responses failed.");
        const respData = await respRes.json();
        setTestCases(respData.testCases || []);
        setCritiques(crits);
        setResponses(respData.responses || []);
        setProgress({ stage: "complete" });
        return;
      }

      if (currentStage === "resolving") {
        setProgress({ stage: "resolving", stepName: "Retrying Stage 3: Resolving" });
        const respRes = await fetch("/api/generate-step", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            step: "response",
            requirement,
            draftTestCases: cachedDrafts,
            critiques: cachedCritiques,
          }),
        });

        if (!respRes.ok) throw new Error("Retry of Builder responses failed.");
        const respData = await respRes.json();
        setTestCases(respData.testCases || []);
        setCritiques(cachedCritiques);
        setResponses(respData.responses || []);
        setProgress({ stage: "complete" });
        return;
      }

      // Default fallback
      await runFullPipeline(requirement);
    } catch (err) {
      setProgress({
        stage: "error",
        errorMsg: (err as Error).message || "Retry attempt met validation exception.",
      });
    }
  };

  // Refine flow triggers the pipeline on active cases with refinement rules
  const handleRefine = async () => {
    if (!refinementText.trim()) return;
    const currentRequirementCombined = `${requirement}\n\n[Additional Refined Guideline: ${refinementText}]`;
    setProgress({ stage: "drafting", stepName: "Refining test cases..." });
    await runFullPipeline(currentRequirementCombined, refinementText, testCases);
    setRefinementText("");
  };

    // Real backend sync calls connecting automatically to UiPath Test Manager APIs
  const handleSyncTestCase = async (id: string) => {
    const targetCase = testCases.find((tc) => tc.id === id);
    if (!targetCase) return;

    setSyncingMap((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch("/api/sync-test-case", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ testCase: targetCase }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.simulatedFallback) {
          // If keys are missing, we graciously fall back to local dev-simulation so the user can still preview
          // and see the app build, but we explicitly tell them what they need to configure
          const fakeRemoteId = `MOCK-TM-${Math.floor(10000 + Math.random() * 90000)}`;
          setSyncStatus((prev) => ({ ...prev, [id]: fakeRemoteId }));
          triggerToast(`Demo Sync! To use real UiPath, configure: ${data.error.split(".")[0]}`, "info");
        } else {
          throw new Error(data.error || "Network error occurred.");
        }
      } else {
        const remoteId = data.remoteId;
        setSyncStatus((prev) => ({ ...prev, [id]: remoteId }));
        triggerToast(`Successfully synced to UiPath Test Manager! ID: ${remoteId}`, "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast(`Authorization or API Sync error: ${(err as Error).message}`, "info");
    } finally {
      setSyncingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleSyncAll = async () => {
    const unsyncedCases = testCases.filter((tc) => !syncStatus[tc.id]);
    if (unsyncedCases.length === 0) {
      triggerToast("All finalized test cases are already synced!", "info");
      return;
    }

    setSyncingAll(true);
    triggerToast(`Batch syncing ${unsyncedCases.length} items to UiPath Test Manager...`, "info");

    let successfulSyncs = 0;
    let fallbackMode = false;
    const updatedSyncs = { ...syncStatus };

    try {
      for (const tc of unsyncedCases) {
        const response = await fetch("/api/sync-test-case", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ testCase: tc }),
        });

        const data = await response.json();
        if (response.ok) {
          updatedSyncs[tc.id] = data.remoteId;
          successfulSyncs++;
        } else if (data.simulatedFallback) {
          fallbackMode = true;
          updatedSyncs[tc.id] = `MOCK-TM-${Math.floor(10000 + Math.random() * 90000)}`;
          successfulSyncs++;
        } else {
          throw new Error(data.error || "Sync broke mid-batch.");
        }
      }

      setSyncStatus(updatedSyncs);
      if (fallbackMode) {
        triggerToast(`Multi-batch Demo Sync completed! Done ${successfulSyncs} cases. Configure real secrets to connect natively.`, "info");
      } else {
        triggerToast(`Bulk deployment complete! Synced ${successfulSyncs} test cases directly.`, "success");
      }
    } catch (err) {
      console.error(err);
      triggerToast(`Batch failed: ${(err as Error).message}`, "info");
    } finally {
      setSyncingAll(false);
    }
  };


  if (!currentUser) {
    return (
      <div className="min-h-screen text-primary font-sans flex items-center justify-center p-4 relative overflow-x-hidden">
        <div className="bg-app-gradient" />
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />

        <div className="space-y-6 flex flex-col items-center w-full max-w-md">
          <div className="text-center relative py-2">
            <h1 className="text-4xl font-bold tracking-tight text-[#0c4a6e] mb-1">
              TestForge
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 border border-white/80 rounded-full mb-3 backdrop-blur-md">
              <Layers className="w-3 h-3 text-[#2563eb]" />
              <span className="text-[9px] tracking-widest uppercase font-bold text-[#0369a1]">
                Dual-Agent Adversarial QA Engine
              </span>
            </div>
          </div>

          {authView === "login" && (
            <LoginForm
              onRegisterClick={() => setAuthView("register")}
              onForgotPasswordClick={() => setAuthView("forgot")}
            />
          )}
          {authView === "register" && (
            <RegisterForm onLoginClick={() => setAuthView("login")} />
          )}
          {authView === "forgot" && (
            <ForgotPassword onBackToLoginClick={() => setAuthView("login")} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-primary font-sans pb-16 relative overflow-x-hidden">
      <div className="bg-app-gradient" />
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-[52px] glass-nav z-50 flex items-center justify-between px-6">
        <div className="text-[15px] font-medium text-[#0c4a6e]">
          TestForge
        </div>
        <div className="flex items-center gap-4">
          <div className="border-[0.5px] border-[rgba(37,99,235,0.25)] text-[#1d4ed8] text-[11px] px-[10px] py-[4px] rounded-[4px] bg-[rgba(219,234,254,0.5)] font-medium">
            Track 3 — UiPath Test Cloud
          </div>
          <UserMenu />
        </div>
      </nav>

      {/* Toast Alert */}
      {toastMsg && (
        <div id="toast-banner" className={`fixed top-16 right-6 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 max-w-sm ${
          toastMsg.type === "success" 
            ? "bg-emerald-500/15 border-emerald-400 text-emerald-800"
            : "bg-indigo-500/15 border-indigo-400 text-indigo-800"
        }`}>
          <div className={`p-1.5 rounded-lg ${toastMsg.type === "success" ? "bg-emerald-500/20" : "bg-indigo-500/20"}`}>
            {toastMsg.type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <Activity className="w-4 h-4 text-indigo-600" />}
          </div>
          <span className="text-xs font-semibold leading-relaxed">{toastMsg.text}</span>
        </div>
      )}

      {/* Primary Centered Shell */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-[72px] space-y-8" id="testforge-app-shell">
        
        {/* Header App Title Banner */}
        <header className="text-center relative py-6" id="tf-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 border border-white/80 rounded-full mb-3 backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-[#2563eb]" />
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#0369a1]">
              Dual-Agent Adversarial QA Engine
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0c4a6e] mb-3">
            TestForge
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#0369a1] antialiased leading-relaxed">
            Submit a requirement, and watch two independent AI agents negotiate, find missing test paths, and construct premium vetted test suites automatically.
          </p>
        </header>

        {/* Requirements Input Area */}
        <section id="input-section">
          <InputPanel
            value={requirement}
            onChange={setRequirement}
            onSubmit={() => runFullPipeline(requirement)}
            loading={progress.stage !== "idle" && progress.stage !== "complete" && progress.stage !== "error"}
          />
        </section>

        {/* Action Pipeline Step Progress Tracker */}
        {progress.stage !== "idle" && (
          <section id="pipeline-tracker-section" className="transition-all duration-300">
            {progress.stage !== "complete" && progress.stage !== "error" && (
              <div className="text-center text-xs text-[#0369a1] mb-2 flex items-center justify-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-[#2563eb]" />
                <span>{progress.stepName || "Executing adversarial phase..."}</span>
              </div>
            )}
            <PipelineTracker
              stage={progress.stage}
              errorMsg={progress.errorMsg}
              onRetry={handleStepRetry}
            />
          </section>
        )}

        {/* Results layout */}
        {testCases.length > 0 && (
          <main className="space-y-8" id="results-display-area">
            
            {/* Header counters */}
            <div className="flex items-center justify-between border-b border-[#0c4a6e]/10 pb-4 flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#0c4a6e]">
                  Vetted Test Cases ({testCases.length})
                </h3>
                <p className="text-xs text-[#0369a1] mt-1">
                  Double-checked and verified by Skeptic adversarial reviews.
                </p>
              </div>

              <button
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="px-4 py-2 bg-white/50 border border-[rgba(37,99,235,0.20)] text-[#1d4ed8] hover:bg-white/75 hover:border-[rgba(37,99,235,0.40)] font-normal text-xs rounded-xl flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FolderSync className="w-4 h-4 text-[#1d4ed8]" />
                {syncingAll ? "Syncing Batch..." : "Sync All Vetted Cases"}
              </button>
            </div>

            {/* Test Case responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="testcase-grid">
              {testCases.map((tc, idx) => (
                <TestCaseCard
                  key={tc.id}
                  testCase={tc}
                  index={idx}
                  onSync={handleSyncTestCase}
                  syncing={!!syncingMap[tc.id]}
                  syncedId={syncStatus[tc.id] || null}
                />
              ))}
            </div>

            {/* Collapsible centerpiece: Debate Review Trail log panel */}
            <section id="debate-panel-section">
              <ReviewTrail
                critiques={critiques}
                responses={responses}
                testCases={testCases}
              />
            </section>

            {/* Refinement Flow section */}
            <section id="refinement-controls" className="glass-card">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquareDiff className="w-4 h-4 text-[#0369a1]" />
                <h3 className="text-[11px] font-medium tracking-[0.08em] text-[#0369a1] uppercase">
                  Refine These Test Cases
                </h3>
              </div>

              <p className="text-xs text-[#0369a1] mb-4 leading-relaxed">
                Need to add specific edge cases, mock configurations, or update testing constraints? Describe your adjustments and the dual-agents will re-evaluate!
              </p>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="e.g., Assert HTTP 403 Forbidden specifically when authorization claims are absent..."
                  className="flex-1 bg-white/45 border border-white/75 rounded-[10px] px-4 py-2 text-sm text-[#0c4a6e] focus:outline-none focus:border-[rgba(37,99,235,0.45)] transition placeholder:text-[#7dd3fc]"
                />
                <button
                  onClick={handleRefine}
                  disabled={!refinementText.trim() || progress.stage === "drafting" || progress.stage === "gaps" || progress.stage === "resolving"}
                  className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-[13px] font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 active:scale-98 disabled:opacity-40"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Refinement
                </button>
              </div>
            </section>

          </main>
        )}

      </div>
    </div>
  );
}
