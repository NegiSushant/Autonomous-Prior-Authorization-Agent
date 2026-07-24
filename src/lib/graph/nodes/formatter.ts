import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { PAAgentState } from "@/lib/schemas/state";
import { FinalBriefing } from "@/lib/schemas/briefing";

export async function formatterNode(
  state: PAAgentState,
): Promise<{ finalReport: FinalBriefing }> {
  // -----------------------------
  // Evaluate Criteria
  // -----------------------------

  const physicalTherapyMet = state.gatheredEvidence.some(
    (evidence) =>
      evidence.sourceType === "EHR" &&
      evidence.snippetText.toLowerCase().includes("physical therapy"),
  );

  const imagingMet = state.gatheredEvidence.some(
    (evidence) => evidence.sourceType === "Imaging",
  );

  // -----------------------------
  // Determine Recommendation
  // -----------------------------

  const recommendationStatus =
    physicalTherapyMet && imagingMet
      ? "Auto-Approved"
      : "Manual Review Required";

  // -----------------------------
  // Criteria Breakdown
  // -----------------------------

  const criteriaBreakdown = [
    {
      criterion: "Conservative therapy completed for at least 6 weeks",

      satisfied: physicalTherapyMet,

      explanation: physicalTherapyMet
        ? "Evidence of completed physical therapy was found."
        : "No sufficient physical therapy documentation was found.",
    },

    {
      criterion: "Diagnostic lumbar X-ray completed within 90 days",

      satisfied: imagingMet,

      explanation: imagingMet
        ? "Lumbar imaging was located."
        : "No qualifying imaging study was found.",
    },
  ];

  // -----------------------------
  // Reasoning Trace
  // -----------------------------

  const reasoningTrace = state.messages
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

  return {
    finalReport: {
      recommendationStatus,
      criteriaBreakdown,
      reasoningTrace,
    },
  };
}
