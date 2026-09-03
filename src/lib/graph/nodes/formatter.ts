import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { FinalBriefing, PAAgentState } from "@/types/agentState.dto";

type CriterionStatus = "Met" | "Not Met" | "Unclear";

export async function formatterNode(
  state: PAAgentState,
): Promise<{ finalReport: FinalBriefing; status?: string }> {
  const rules = (state.policyRules ?? []).filter(
    (r) => typeof r === "string" && r.trim().length > 0,
  );

  const hasConflicts = (state.conflicts?.length ?? 0) > 0;

  // Build one criteria card per retrieved rule (Phase 9)
  const criteriaBreakdown =
    rules.length > 0
      ? rules.map((rule) => evaluateRule(rule, state, hasConflicts))
      : buildFallbackCriteria(state, hasConflicts);

  const anyUnclear = criteriaBreakdown.some((c) => c.status === "Unclear");
  const allMet = criteriaBreakdown.every((c) => c.status === "Met");

  const recommendationStatus: FinalBriefing["recommendationStatus"] =
    hasConflicts || anyUnclear || !allMet
      ? "Manual Review Required"
      : "Auto-Approved";

  const rationale = hasConflicts
    ? "Conflicting clinical evidence is present. Conflicting records cannot be reconciled or assumed resolved automatically. Manual review is required."
    : recommendationStatus === "Auto-Approved"
      ? "All retrieved policy criteria are supported by the available evidence."
      : "One or more retrieved policy criteria are not sufficiently supported by the available evidence.";

  const finalDetermination =
    recommendationStatus === "Auto-Approved"
      ? "Auto-Approved because all retrieved policy criteria are supported by the available evidence."
      : hasConflicts
        ? "Manual Review Required due to conflicting clinical evidence and/or incomplete support for retrieved policy criteria."
        : "Manual Review Required because one or more retrieved policy criteria are not sufficiently supported by the available evidence.";

  return {
    finalReport: {
      recommendationStatus,
      rationale,
      criteriaBreakdown,
      finalDetermination,
      reasoningTrace: buildReasoningTrace(state),
    },
    // keep dashboard status in sync
    status: "completed",
  };
}

function cleanRuleLabel(rule: string): string {
  return rule
    .replace(/^[•\-\*\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function evaluateRule(
  rule: string,
  state: PAAgentState,
  hasConflicts: boolean,
): FinalBriefing["criteriaBreakdown"][number] {
  const label = cleanRuleLabel(rule);
  const r = rule.toLowerCase();
  const evidenceText = state.gatheredEvidence
    .map((e) => e.snippetText.toLowerCase())
    .join("\n");

  // --- Conservative / PT style rules ---
  if (
    /conservative|physical therapy|\bpt\b|chiropractic|physiotherapy|home exercise|failure of conservative/.test(
      r,
    )
  ) {
    const therapyEvidence = getTherapyEvidence(state);

    if (hasConflicts) {
      return {
        criterion: label,
        status: "Unclear",
        explanation:
          "Conflicting evidence is present regarding physical therapy / conservative treatment. Conflicting clinical evidence cannot be reconciled automatically.",
        evidence: therapyEvidence,
        overridden: false,
      };
    }

    const completed = hasCompletedConservativeTherapy(state);
    const onlyRecommended =
      /physical therapy recommended|pt recommended|recommend(ed)? physical therapy/.test(
        evidenceText,
      ) && !completed;

    let status: CriterionStatus = "Not Met";
    let explanation =
      "No sufficient documentation that conservative therapy was completed or failed was found.";

    if (completed) {
      status = "Met";
      explanation =
        "Evidence documenting completion of conservative / physical therapy was found.";
    } else if (onlyRecommended) {
      status = "Not Met";
      explanation =
        'Evidence only shows therapy was "recommended," not completed or failed.';
    }

    return {
      criterion: label,
      status,
      explanation,
      evidence: therapyEvidence,
      overridden: false,
    };
  }

  // --- Ordering clinician ---
  if (/m\.?d\.?|d\.?o\.?|ordered by/.test(r)) {
    const ordered =
      /ordered by.*(m\.?d\.?|d\.?o\.?)|physician order|signed by/.test(
        evidenceText,
      );
    return {
      criterion: label,
      status: ordered ? "Met" : "Not Met",
      explanation: ordered
        ? "Evidence indicates the study was ordered by a qualified clinician."
        : "Ordering clinician (M.D./D.O.) was not established from the available evidence.",
      evidence: [],
      overridden: false,
    };
  }

  // --- Symptom duration ---
  if (/month|weeks of symptoms|duration|persistent/.test(r)) {
    const hasDuration =
      /\d+\s*(week|month)s?/.test(evidenceText) ||
      /persistent|chronic|ongoing for/.test(evidenceText);
    return {
      criterion: label,
      status: hasDuration ? "Met" : "Not Met",
      explanation: hasDuration
        ? "Symptom duration supporting this criterion was documented."
        : "Symptom duration required by policy was not established from the evidence.",
      evidence: [],
      overridden: false,
    };
  }

  // --- Imaging / prior diagnostics ---
  if (
    /x-?ray|imaging|radiolog/.test(r) &&
    /within|completed|prior|diagnostic/.test(r)
  ) {
    const imagingEvidence = getImagingEvidence(state);
    const imagingMet = hasQualifyingLumbarImaging(state);
    return {
      criterion: label,
      status: imagingMet ? "Met" : "Not Met",
      explanation: imagingMet
        ? "Qualifying imaging evidence was found."
        : "Required imaging documentation was not found.",
      evidence: imagingEvidence,
      overridden: false,
    };
  }

  // --- Generic retrieved rule ---
  return {
    criterion: label,
    status: "Not Met",
    explanation:
      state.gatheredEvidence.length > 0
        ? "Some clinical evidence was collected, but it does not clearly satisfy this retrieved policy criterion."
        : "No supporting evidence was found for this retrieved policy criterion.",
    evidence: [],
    overridden: false,
  };
}

function buildFallbackCriteria(
  state: PAAgentState,
  hasConflicts: boolean,
): FinalBriefing["criteriaBreakdown"] {
  // Only used when RAG returned no rules
  const therapyEvidence = getTherapyEvidence(state);
  const imagingEvidence = getImagingEvidence(state);
  const therapyMet = hasCompletedConservativeTherapy(state);
  const imagingMet = hasQualifyingLumbarImaging(state);

  return [
    {
      criterion: "Conservative therapy requirement (no policy retrieved)",
      status: hasConflicts ? "Unclear" : therapyMet ? "Met" : "Not Met",
      explanation: hasConflicts
        ? "Conflicting evidence regarding conservative therapy."
        : therapyMet
          ? "Conservative therapy completion documented."
          : "Conservative therapy completion not documented.",
      evidence: therapyEvidence,
      overridden: false,
    },
    {
      criterion: "Supporting imaging / clinical documentation",
      status: imagingMet ? "Met" : "Not Met",
      explanation: imagingMet
        ? "Supporting imaging found."
        : "Supporting imaging not found.",
      evidence: imagingEvidence,
      overridden: false,
    },
  ];
}

// ---- helpers (same ideas as before, slightly tightened) ----

function hasCompletedConservativeTherapy(state: PAAgentState): boolean {
  return state.gatheredEvidence.some((evidence) => {
    if (evidence.sourceType !== "EHR") return false;
    const text = evidence.snippetText.toLowerCase();
    if (
      text.includes("refused physical therapy") ||
      text.includes("declined physical therapy") ||
      text.includes("did not complete physical therapy")
    ) {
      return false;
    }
    return (
      text.includes("completed 6 weeks of physical therapy") ||
      text.includes("completed six weeks of physical therapy") ||
      text.includes("completed physical therapy")
    );
  });
}

function hasQualifyingLumbarImaging(state: PAAgentState): boolean {
  return state.gatheredEvidence.some((evidence) => {
    if (evidence.sourceType !== "Imaging") return false;
    const text = evidence.snippetText.toLowerCase();
    return text.includes("lumbar") || text.includes("lumbar spine");
  });
}

function buildReasoningTrace(state: PAAgentState): string[] {
  return state.messages
    .map((message) => {
      if (HumanMessage.isInstance(message)) return `Human: ${message.text}`;
      if (AIMessage.isInstance(message)) return `AI: ${message.text}`;
      if (ToolMessage.isInstance(message)) return `Tool: ${message.text}`;
      return "";
    })
    .filter(Boolean);
}

function getTherapyEvidence(state: PAAgentState) {
  return state.gatheredEvidence
    .filter((evidence) => {
      if (evidence.sourceType !== "EHR") return false;
      const text = evidence.snippetText.toLowerCase();
      return (
        text.includes("physical therapy") ||
        text.includes("physiotherapy") ||
        text.includes("conservative therapy") ||
        text.includes("chiropractic") ||
        text.includes("acupuncture") ||
        text.includes("home exercise")
      );
    })
    .map((evidence) => ({
      date: evidence.dateFound,
      snippet: evidence.snippetText,
      sourceType: evidence.sourceType,
      documentId: evidence.documentId,
    }));
}

function getImagingEvidence(state: PAAgentState) {
  return state.gatheredEvidence
    .filter((evidence) => {
      if (evidence.sourceType !== "Imaging") return false;
      const text = evidence.snippetText.toLowerCase();
      return text.includes("lumbar") || text.includes("lumbar spine");
    })
    .map((evidence) => ({
      date: evidence.dateFound,
      snippet: evidence.snippetText,
      sourceType: evidence.sourceType,
      documentId: evidence.documentId,
    }));
}
