import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { PAAgentState } from "@/lib/schemas/state";
import {
  ExecutionStep,
  PriorAuthResponse,
  CriterionEvaluation,
} from "@/types/prior-auth-response";

export function mapAgentResponse(state: PAAgentState): PriorAuthResponse {
  const executionTrace: ExecutionStep[] = [];
  let recommendation = "Unknown";
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
        recommendation = content;
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

// Build policy criteria from collected evidence
function buildCriteria(state: PAAgentState): CriterionEvaluation[] {
  // Criterion 1: Conservative therapy completed for at least 6 weeks
  const physicalTherapyEvidence = state.gatheredEvidence.filter(
    (evidence) =>
      evidence.sourceType === "EHR" &&
      evidence.snippetText
        .toLowerCase()
        .includes("completed 6 weeks of physical therapy"),
  );

  const hasPhysicalTherapyConflict = state.conflicts.some((conflict) =>
    conflict.toLowerCase().includes("physical therapy"),
  );

  const physicalTherapyMet =
    physicalTherapyEvidence.length > 0 && !hasPhysicalTherapyConflict;
  // Criterion 2: Diagnostic lumbar X-ray completed within 90 days
  const imagingEvidence = state.gatheredEvidence.filter(
    (evidence) =>
      evidence.sourceType === "Imaging" &&
      evidence.snippetText.toLowerCase().includes("lumbar"),
  );

  const imagingMet = imagingEvidence.length > 0;
  // Return criteria
  return [
    {
      id: "conservative-therapy",
      criterion: "Conservative therapy completed for at least 6 weeks",
      satisfied: physicalTherapyMet,
      explanation: hasPhysicalTherapyConflict
        ? "Conflicting evidence exists regarding physical therapy completion. Manual review is required."
        : physicalTherapyMet
          ? `Evidence of completed 6 weeks of physical therapy was found.`
          : "No sufficient evidence of completed 6 weeks of conservative therapy was found.",
    },
    {
      id: "lumbar-xray",
      criterion: "Diagnostic lumbar X-ray completed within 90 days",
      satisfied: imagingMet,
      explanation: imagingMet
        ? "Qualifying lumbar imaging evidence was found."
        : "No qualifying lumbar X-ray evidence was found.",
    },
  ];
}
