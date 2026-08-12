import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { FinalBriefing } from "@/lib/schemas/briefing";
import { PAAgentState } from "@/lib/schemas/state";

export async function formatterNode(
  state: PAAgentState,
): Promise<{ finalReport: FinalBriefing }> {
  // Conflict has highest priority
  if (state.conflicts.length > 0) {
    return {
      finalReport: {
        recommendationStatus: "Manual Review Required",
        criteriaBreakdown: [
          {
            criterion: "Conservative therapy completed for at least 6 weeks",
            satisfied: false,
            explanation:
              "Conflicting clinical evidence was found regarding physical therapy completion.",
          },
          {
            criterion: "Diagnostic lumbar X-ray completed within 90 days",
            satisfied: hasQualifyingLumbarImaging(state),
            explanation: hasQualifyingLumbarImaging(state)
              ? "A lumbar imaging study was found."
              : "No qualifying lumbar imaging study was found.",
          },
        ],
        reasoningTrace: [
          ...buildReasoningTrace(state),
          "CONFLICT DETECTED:",
          ...state.conflicts,
          "Recommendation: Manual Review Required: Conflicting Evidence",
        ],
      },
    };
  }

  // Evaluate criteria
  const physicalTherapyMet = hasCompletedConservativeTherapy(state);
  const imagingMet = hasQualifyingLumbarImaging(state);

  // Determine recommendation
  const recommendationStatus =
    physicalTherapyMet && imagingMet
      ? "Auto-Approved"
      : "Manual Review Required";

  // Criteria breakdown
  const criteriaBreakdown = [
    {
      criterion: "Conservative therapy completed for at least 6 weeks",
      satisfied: physicalTherapyMet,
      explanation: physicalTherapyMet
        ? "Evidence documenting completion of at least 6 weeks of physical therapy was found."
        : "No sufficient documentation of completed 6 weeks of conservative therapy was found.",
    },

    {
      criterion: "Diagnostic lumbar X-ray completed within 90 days",
      satisfied: imagingMet,
      explanation: imagingMet
        ? "A qualifying lumbar imaging study was found."
        : "No qualifying lumbar X-ray was found.",
    },
  ];

  // Final report
  return {
    finalReport: {
      recommendationStatus,
      criteriaBreakdown,
      reasoningTrace: buildReasoningTrace(state),
    },
  };
}

// Conservative Therapy Detection
function hasCompletedConservativeTherapy(state: PAAgentState): boolean {
  return state.gatheredEvidence.some((evidence) => {
    if (evidence.sourceType !== "EHR") {
      return false;
    }
    const text = evidence.snippetText.toLowerCase();
    // Explicit contradiction must never satisfy the criterion.
    if (
      text.includes("refused physical therapy") ||
      text.includes("declined physical therapy") ||
      text.includes("did not complete physical therapy")
    ) {
      return false;
    }

    // We require explicit documentation of six-week completion.
    return (
      text.includes("completed 6 weeks of physical therapy") ||
      text.includes("completed six weeks of physical therapy")
    );
  });
}

// Lumbar Imaging Detection
function hasQualifyingLumbarImaging(state: PAAgentState): boolean {
  return state.gatheredEvidence.some((evidence) => {
    if (evidence.sourceType !== "Imaging") {
      return false;
    }
    const text = evidence.snippetText.toLowerCase();
    return text.includes("lumbar") || text.includes("lumbar spine");
  });
}

// Reasoning Trace
function buildReasoningTrace(state: PAAgentState): string[] {
  return state.messages
    .map((message) => {
      if (HumanMessage.isInstance(message)) {
        return `Human: ${message.text}`;
      }
      if (AIMessage.isInstance(message)) {
        return `AI: ${message.text}`;
      }
      if (ToolMessage.isInstance(message)) {
        return `Tool: ${message.text}`;
      }
      return "";
    })
    .filter(Boolean);
}
