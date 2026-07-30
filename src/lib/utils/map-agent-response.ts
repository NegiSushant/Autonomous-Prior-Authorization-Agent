import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { PAAgentState } from "@/lib/schemas/state";
import { ExecutionStep, PriorAuthResponse } from "@/types/prior-auth-response";

export function mapAgentResponse(state: PAAgentState): PriorAuthResponse {
  const executionTrace: ExecutionStep[] = [];
  let recommendation = "Unknown";
  for (const message of state.messages) {
    // AI Reasoning
    if (message instanceof AIMessage) {
      if (message.tool_calls?.length) {
        executionTrace.push({
          type: "reasoner",
          title: "Reasoning",
          content:
            message.content?.toString() ||
            "Agent decided to invoke one or more tools.",
        });

        for (const tool of message.tool_calls) {
          executionTrace.push({
            type: "tool",
            title: "Tool Invocation",
            content: `${tool.name}`,
            toolName: tool.name,
            toolArguments: tool.args,
          });
        }
      } else {
        recommendation = message.content.toString();
        executionTrace.push({
          type: "reasoner",
          title: "Final Recommendation",
          content: message.content.toString(),
        });
      }
    }
    // Tool Output
    if (message instanceof ToolMessage) {
      let parsed: unknown = message.content;
      try {
        parsed = JSON.parse(message.content.toString());
      } catch {
        // Ignore parse errors
      }

      executionTrace.push({
        type: "tool",
        title: "Tool Result",
        content: message.name ?? "Tool",
        toolName: message.name,
        toolResult: parsed,
      });
    }
    // Reflection
    if (message instanceof HumanMessage) {
      executionTrace.push({
        type: "reflection",
        title: "Reflection",
        content: message.content.toString(),
      });
    }
  }

  return {
    patientId: state.patientDetails.patientId,
    status: state.status,
    recommendation,
    gatheredEvidence: state.gatheredEvidence,
    executionTrace,
  };
}
