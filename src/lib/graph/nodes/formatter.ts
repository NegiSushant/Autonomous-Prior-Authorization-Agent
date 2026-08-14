import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { FinalBriefing } from "@/lib/schemas/briefing";
import { PAAgentState } from "@/lib/schemas/state";

export async function formatterNode(
  state: PAAgentState,
): Promise<{ finalReport: FinalBriefing }> {
  const imagingMet = hasQualifyingLumbarImaging(state);

  // ==================================================
  // CONFLICT CASE
  // ==================================================

  if (state.conflicts.length > 0) {
    const therapyEvidence = getTherapyEvidence(state);
    const imagingEvidence = getImagingEvidence(state);

    return {
      finalReport: {
        recommendationStatus: "Manual Review Required",

        rationale:
          "Conflicting clinical evidence is present regarding completion of the required conservative therapy. The conflicting evidence cannot be reconciled or assumed to be resolved automatically.",

        criteriaBreakdown: [
          {
            criterion: "Conservative therapy completed for at least 6 weeks",

            status: "Unclear",

            explanation:
              "Conflicting evidence is present regarding physical therapy completion. Per the policy evaluation rules, conflicting clinical evidence cannot be reconciled or assumed to be resolved. This criterion cannot be confirmed for automatic approval.",

            evidence: therapyEvidence,

            overridden: false,
          },

          {
            criterion:
              "Diagnostic lumbar X-ray completed within the last 90 days",

            status: imagingMet ? "Met" : "Not Met",

            explanation: imagingMet
              ? "The required lumbar imaging evidence was found."
              : "No qualifying lumbar X-ray evidence was found.",

            evidence: imagingEvidence,

            overridden: false,
          },
        ],

        finalDetermination:
          "Manual Review Required due to conflicting evidence regarding completion of the required conservative therapy.",

        reasoningTrace: buildReasoningTrace(state),
      },
    };
  }

  // ==================================================
  // NORMAL CASE
  // ==================================================

  const physicalTherapyMet = hasCompletedConservativeTherapy(state);

  const recommendationStatus =
    physicalTherapyMet && imagingMet
      ? "Auto-Approved"
      : "Manual Review Required";

  const therapyEvidence = getTherapyEvidence(state);
  const imagingEvidence = getImagingEvidence(state);

  const criteriaBreakdown = [
    {
      criterion: "Conservative therapy completed for at least 6 weeks",

      status: physicalTherapyMet ? ("Met" as const) : ("Not Met" as const),

      explanation: physicalTherapyMet
        ? "Evidence documenting completion of at least 6 weeks of physical therapy was found."
        : "No sufficient documentation of completed 6 weeks of conservative therapy was found.",

      evidence: therapyEvidence,

      overridden: false,
    },

    {
      criterion: "Diagnostic lumbar X-ray completed within the last 90 days",

      status: imagingMet ? ("Met" as const) : ("Not Met" as const),

      explanation: imagingMet
        ? "The required lumbar imaging evidence was found."
        : "No qualifying lumbar X-ray evidence was found.",

      evidence: imagingEvidence,

      overridden: false,
    },
  ];

  const finalDetermination =
    recommendationStatus === "Auto-Approved"
      ? "Auto-Approved because all required policy criteria are supported by the available evidence."
      : "Manual Review Required because one or more required policy criteria are not sufficiently supported by the available evidence.";

  return {
    finalReport: {
      recommendationStatus,

      rationale:
        recommendationStatus === "Auto-Approved"
          ? "All required policy criteria are supported by the available evidence."
          : "One or more required policy criteria are not sufficiently supported by the available evidence.",

      criteriaBreakdown,

      finalDetermination,

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
    // Explicit contradictions must never satisfy the criterion.
    if (
      text.includes("refused physical therapy") ||
      text.includes("declined physical therapy") ||
      text.includes("did not complete physical therapy")
    ) {
      return false;
    }
    // Require explicit 6-week completion.
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

function getTherapyEvidence(state: PAAgentState) {
  return state.gatheredEvidence
    .filter((evidence) => {
      if (evidence.sourceType !== "EHR") {
        return false;
      }

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
      if (evidence.sourceType !== "Imaging") {
        return false;
      }

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

// import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
// import { FinalBriefing } from "@/lib/schemas/briefing";
// import { PAAgentState } from "@/lib/schemas/state";

// export async function formatterNode(
//   state: PAAgentState,
// ): Promise<{ finalReport: FinalBriefing }> {
//   // Conflict has highest priority
//   if (state.conflicts.length > 0) {
//     return {
//       finalReport: {
//         recommendationStatus: "Manual Review Required",
//         criteriaBreakdown: [
//           {
//             criterion: "Conservative therapy completed for at least 6 weeks",
//             satisfied: false,
//             explanation:
//               "Conflicting clinical evidence was found regarding physical therapy completion.",
//           },
//           {
//             criterion: "Diagnostic lumbar X-ray completed within 90 days",
//             satisfied: hasQualifyingLumbarImaging(state),
//             explanation: hasQualifyingLumbarImaging(state)
//               ? "A lumbar imaging study was found."
//               : "No qualifying lumbar imaging study was found.",
//           },
//         ],
//         reasoningTrace: [
//           ...buildReasoningTrace(state),
//           "CONFLICT DETECTED:",
//           ...state.conflicts,
//           "Recommendation: Manual Review Required: Conflicting Evidence",
//         ],
//       },
//     };
//   }

//   // Evaluate criteria
//   const physicalTherapyMet = hasCompletedConservativeTherapy(state);
//   const imagingMet = hasQualifyingLumbarImaging(state);

//   // Determine recommendation
//   const recommendationStatus =
//     physicalTherapyMet && imagingMet
//       ? "Auto-Approved"
//       : "Manual Review Required";

//   // Criteria breakdown
//   const criteriaBreakdown = [
//     {
//       criterion: "Conservative therapy completed for at least 6 weeks",
//       satisfied: physicalTherapyMet,
//       explanation: physicalTherapyMet
//         ? "Evidence documenting completion of at least 6 weeks of physical therapy was found."
//         : "No sufficient documentation of completed 6 weeks of conservative therapy was found.",
//     },

//     {
//       criterion: "Diagnostic lumbar X-ray completed within 90 days",
//       satisfied: imagingMet,
//       explanation: imagingMet
//         ? "A qualifying lumbar imaging study was found."
//         : "No qualifying lumbar X-ray was found.",
//     },
//   ];

//   // Final report
//   return {
//     finalReport: {
//       recommendationStatus,
//       criteriaBreakdown,
//       reasoningTrace: buildReasoningTrace(state),
//     },
//   };
// }

// // Conservative Therapy Detection
// function hasCompletedConservativeTherapy(state: PAAgentState): boolean {
//   return state.gatheredEvidence.some((evidence) => {
//     if (evidence.sourceType !== "EHR") {
//       return false;
//     }
//     const text = evidence.snippetText.toLowerCase();
//     // Explicit contradiction must never satisfy the criterion.
//     if (
//       text.includes("refused physical therapy") ||
//       text.includes("declined physical therapy") ||
//       text.includes("did not complete physical therapy")
//     ) {
//       return false;
//     }

//     // We require explicit documentation of six-week completion.
//     return (
//       text.includes("completed 6 weeks of physical therapy") ||
//       text.includes("completed six weeks of physical therapy")
//     );
//   });
// }

// // Lumbar Imaging Detection
// function hasQualifyingLumbarImaging(state: PAAgentState): boolean {
//   return state.gatheredEvidence.some((evidence) => {
//     if (evidence.sourceType !== "Imaging") {
//       return false;
//     }
//     const text = evidence.snippetText.toLowerCase();
//     return text.includes("lumbar") || text.includes("lumbar spine");
//   });
// }

// // Reasoning Trace
// function buildReasoningTrace(state: PAAgentState): string[] {
//   return state.messages
//     .map((message) => {
//       if (HumanMessage.isInstance(message)) {
//         return `Human: ${message.text}`;
//       }
//       if (AIMessage.isInstance(message)) {
//         return `AI: ${message.text}`;
//       }
//       if (ToolMessage.isInstance(message)) {
//         return `Tool: ${message.text}`;
//       }
//       return "";
//     })
//     .filter(Boolean);
// }
