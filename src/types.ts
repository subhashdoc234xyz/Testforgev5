export interface TestCase {
  id: string;            // e.g. "TC-001"
  title: string;          // max 120 chars
  priority: "critical" | "high" | "medium" | "low";
  preconditions: string[];
  steps: { action: string; expectedResult: string }[];
  labels: string[];
  status: "draft" | "revised" | "final";
  isNew?: boolean;       // For refinement passes, to display a "new" tag
}

export interface Critique {
  id: string;                      // e.g. "CRIT-001"
  targetTestCaseId: string | null; // null = critique about a MISSING test case, not an existing one
  severity: "major" | "minor";
  issue: string;                   // the specific problem, plainly stated
  suggestedFix: string;            // what the Skeptic thinks should change
}

export interface BuilderResponse {
  critiqueId: string;              // matches a Critique.id
  action: "fixed" | "rejected";
  explanation: string;             // why fixed this way, or why rejected
  updatedTestCase?: TestCase;       // present only if action === "fixed"
}

export type PipelineStage = "idle" | "drafting" | "gaps" | "resolving" | "complete" | "error";

export interface PipelineProgress {
  stage: PipelineStage;
  errorMsg?: string;
  stepName?: string;
}
