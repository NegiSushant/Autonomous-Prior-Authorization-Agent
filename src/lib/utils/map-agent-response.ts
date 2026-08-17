import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { PAAgentState } from "@/lib/schemas/state";
import {
  ExecutionStep,
  PriorAuthResponse,
  CriterionEvaluation,
} from "@/types/prior-auth-response";

export function mapAgentResponse(state: PAAgentState): PriorAuthResponse {
  const executionTrace: ExecutionStep[] = [];
  const recommendation = state.finalReport?.recommendationStatus ?? "Unknown";
  // BUILD EXECUTION TRACE
  for (const message of state.messages) {
    // AI MESSAGE
    if (AIMessage.isInstance(message)) {
      const toolCalls = message.tool_calls ?? [];
      // Agent requested tools
      if (toolCalls.length > 0) {
        executionTrace.push({
          type: "reasoner",
          title: "Reasoning",
          content: message.text || "Agent decided to invoke one or more tools.",
        });

        for (const toolCall of toolCalls) {
          executionTrace.push({
            type: "tool",
            title: "Tool Invocation",
            content: toolCall.name,
            toolName: toolCall.name,
            toolArguments: toolCall.args,
          });
        }
      }
      // Agent produced final response
      else {
        const content = message.text || "";
        // recommendation = content;
        executionTrace.push({
          type: "reasoner",
          title: "Final Recommendation",
          content,
        });
      }
      continue;
    }
    // TOOL MESSAGE
    if (ToolMessage.isInstance(message)) {
      let parsedResult: unknown = message.content;
      try {
        if (typeof message.content === "string") {
          parsedResult = JSON.parse(message.content);
        }
      } catch {
        // Keep raw content if it is not valid JSON.
      }
      executionTrace.push({
        type: "tool",
        title: "Tool Result",
        content: message.name ?? "Tool Result",
        toolName: message.name,
        toolResult: parsedResult,
      });
      continue;
    }
    // HUMAN MESSAGE: Reflect node uses HumanMessage to inject guidance back into the Reasoner.
    if (HumanMessage.isInstance(message)) {
      executionTrace.push({
        type: "reflection",
        title: "Reflection",
        content: message.text,
      });
    }
  }
  // BUILD CRITERIA EVALUATION
  const criteria = buildCriteria(state);
  // FINAL RESPONSE
  return {
    patientId: state.patientDetails.patientId,
    status: state.status,
    recommendation,
    criteria,
    gatheredEvidence: state.gatheredEvidence,
    executionTrace,
  };
}


function buildCriteria(state: PAAgentState): CriterionEvaluation[] {
  // 1) Prefer structured criteria from the formatter (criteriaBreakdown)
  const fromReport = state.finalReport?.criteriaBreakdown;

  if (Array.isArray(fromReport) && fromReport.length > 0) {
    return fromReport.map((c, i) => ({
      id: `criterion-${i + 1}`,
      criterion: c.criterion,
      satisfied: c.status === "Met",
      explanation: c.explanation,
    }));
  }

  const rules = (state.policyRules ?? []).filter(
    (r) => typeof r === "string" && r.trim().length > 0,
  );
  const evidenceText = state.gatheredEvidence
    .map((e) => `${e.sourceType} ${e.snippetText}`.toLowerCase())
    .join("\n");
  const conflictText = (state.conflicts ?? []).join(" ").toLowerCase();

  // 2) Retrieved policyRules → one card per rule
  if (rules.length > 0) {
    return rules.map((rule, index) => {
      const label = cleanRuleLabel(rule);
      const evaluation = evaluateRuleAgainstEvidence(
        rule,
        evidenceText,
        conflictText,
      );

      return {
        id: `policy-rule-${index + 1}`,
        criterion: label,
        satisfied: evaluation.satisfied,
        explanation: evaluation.explanation,
      };
    });
  }

  // 3) Fallback
  return [
    {
      id: "insufficient-policy-context",
      criterion: "Policy criteria evaluation",
      satisfied: false,
      explanation:
        "No policy rules were retrieved for this request. Manual review is required.",
    },
  ];
}

function cleanRuleLabel(rule: string): string {
  return rule
    .replace(/^[•\-\*\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function evaluateRuleAgainstEvidence(
  rule: string,
  evidenceText: string,
  conflictText: string,
): { satisfied: boolean; explanation: string } {
  const r = rule.toLowerCase();

  // Conflicts always force manual / not met
  if (
    conflictText &&
    (r.includes("physical therapy") ||
      r.includes("conservative") ||
      r.includes("therapy"))
  ) {
    if (
      conflictText.includes("physical therapy") ||
      conflictText.includes("conservative")
    ) {
      return {
        satisfied: false,
        explanation:
          "Conflicting evidence exists for this criterion. Manual review is required.",
      };
    }
  }

  // Conservative therapy / PT / failure of conservative care
  if (
    /conservative|physical therapy|\bpt\b|chiropractic|physiotherapy|home exercise/.test(
      r,
    )
  ) {
    const completed =
      /completed\s+\d+\s+weeks/.test(evidenceText) ||
      /completed.*physical therapy/.test(evidenceText) ||
      /finished.*physical therapy/.test(evidenceText) ||
      /completed.*conservative/.test(evidenceText);

    const onlyRecommended =
      /physical therapy recommended|pt recommended|recommend(ed)? physical therapy/.test(
        evidenceText,
      ) && !completed;

    if (completed) {
      return {
        satisfied: true,
        explanation:
          "Evidence of completed conservative / physical therapy was found.",
      };
    }
    if (onlyRecommended) {
      return {
        satisfied: false,
        explanation:
          'Evidence only shows therapy was "recommended," not completed or failed. Insufficient for this criterion.',
      };
    }
    return {
      satisfied: false,
      explanation:
        "No sufficient evidence of completed conservative therapy was found.",
    };
  }

  // Ordering clinician (M.D. / D.O.)
  if (/m\.?d\.?|d\.?o\.?|ordered by/.test(r)) {
    const ordered =
      /ordered by.*(m\.?d\.?|d\.?o\.?)|physician order|signed by/.test(
        evidenceText,
      );
    return ordered
      ? {
          satisfied: true,
          explanation:
            "Evidence indicates the study was ordered by a qualified clinician.",
        }
      : {
          satisfied: false,
          explanation:
            "Ordering clinician (M.D./D.O.) was not established from the available evidence.",
        };
  }

  // Duration of symptoms
  if (/month|weeks of symptoms|duration|persistent/.test(r)) {
    const hasDuration =
      /\d+\s*(week|month)s?/.test(evidenceText) ||
      /persistent|chronic|ongoing for/.test(evidenceText);
    return hasDuration
      ? {
          satisfied: true,
          explanation:
            "Symptom duration supporting this criterion was documented.",
        }
      : {
          satisfied: false,
          explanation:
            "Symptom duration required by policy was not established from the evidence.",
        };
  }

  // Imaging / X-ray / MRI already done (supporting diagnostics)
  if (
    /x-?ray|imaging|radiolog|mri/.test(r) &&
    /within|completed|prior|diagnostic/.test(r)
  ) {
    const hasImaging =
      evidenceText.includes("imaging") ||
      evidenceText.includes("x-ray") ||
      evidenceText.includes("xray") ||
      evidenceText.includes("radiolog");
    return hasImaging
      ? {
          satisfied: true,
          explanation: "Qualifying imaging evidence was found.",
        }
      : {
          satisfied: false,
          explanation: "Required imaging documentation was not found.",
        };
  }

  // Generic: any overlapping clinical signal
  if (evidenceText.trim().length > 0) {
    return {
      satisfied: false,
      explanation:
        "Some clinical evidence was collected, but it does not clearly satisfy this retrieved policy criterion. Manual review may be required.",
    };
  }

  return {
    satisfied: false,
    explanation:
      "No supporting evidence was found for this retrieved policy criterion.",
  };
}

// // Build policy criteria from collected evidence
// function buildCriteria(state: PAAgentState): CriterionEvaluation[] {
//   // Criterion 1: Conservative therapy completed for at least 6 weeks
//   const physicalTherapyEvidence = state.gatheredEvidence.filter(
//     (evidence) =>
//       evidence.sourceType === "EHR" &&
//       evidence.snippetText
//         .toLowerCase()
//         .includes("completed 6 weeks of physical therapy"),
//   );

//   const hasPhysicalTherapyConflict = state.conflicts.some((conflict) =>
//     conflict.toLowerCase().includes("physical therapy"),
//   );

//   const physicalTherapyMet =
//     physicalTherapyEvidence.length > 0 && !hasPhysicalTherapyConflict;
//   // Criterion 2: Diagnostic lumbar X-ray completed within 90 days
//   const imagingEvidence = state.gatheredEvidence.filter(
//     (evidence) =>
//       evidence.sourceType === "Imaging" &&
//       evidence.snippetText.toLowerCase().includes("lumbar"),
//   );

//   const imagingMet = imagingEvidence.length > 0;
//   // Return criteria
//   return [
//     {
//       id: "conservative-therapy",
//       criterion: "Conservative therapy completed for at least 6 weeks",
//       satisfied: physicalTherapyMet,
//       explanation: hasPhysicalTherapyConflict
//         ? "Conflicting evidence exists regarding physical therapy completion. Manual review is required."
//         : physicalTherapyMet
//           ? `Evidence of completed 6 weeks of physical therapy was found.`
//           : "No sufficient evidence of completed 6 weeks of conservative therapy was found.",
//     },
//     {
//       id: "lumbar-xray",
//       criterion: "Diagnostic lumbar X-ray completed within 90 days",
//       satisfied: imagingMet,
//       explanation: imagingMet
//         ? "Qualifying lumbar imaging evidence was found."
//         : "No qualifying lumbar X-ray evidence was found.",
//     },
//   ];
// }
