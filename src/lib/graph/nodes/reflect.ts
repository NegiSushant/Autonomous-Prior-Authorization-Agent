import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { PAAgentState } from "@/lib/schemas/state";

interface ParsedToolResult {
  success: boolean;
  results: unknown[];
  message?: string;
}

interface ToolFailure {
  toolName: string;
  reason: "empty" | "failed";
}

export async function reflectNode(
  state: PAAgentState,
): Promise<Partial<PAAgentState>> {
  const newMessages: HumanMessage[] = [];

  const toolMessages = state.messages.filter(ToolMessage.isInstance);

  if (toolMessages.length === 0) {
    return {};
  }

  // --------------------------------------------------
  // Inspect ALL recent tool results
  // --------------------------------------------------

  const failures: ToolFailure[] = [];

  for (const toolMessage of toolMessages) {
    const parsed = parseToolResult(toolMessage);

    if (!parsed) {
      continue;
    }

    if (!parsed.success || parsed.results.length === 0) {
      const toolName = findToolName(state, toolMessage);

      if (toolName) {
        failures.push({
          toolName,
          reason: parsed.success ? "empty" : "failed",
        });
      }
    }
  }

  // --------------------------------------------------
  // Generate guidance for empty tools
  // --------------------------------------------------

  for (const failure of failures) {
    newMessages.push(
      new HumanMessage(getEmptyResultGuidance(failure.toolName)),
    );
  }

  // --------------------------------------------------
  // Duplicate tool detection
  // --------------------------------------------------

  const duplicateCall = findDuplicateToolCall(state);

  if (duplicateCall) {
    newMessages.push(
      new HumanMessage(
        [
          "WARNING: Duplicate tool call detected.",
          "",
          `The tool "${duplicateCall}" was already called with the same parameters.`,
          "",
          "Do NOT repeat the same search.",
          "",
          "Use a different search term, another relevant tool,",
          "or conclude that the available evidence is insufficient.",
        ].join("\n"),
      ),
    );
  }

  return {
    messages: newMessages,
  };
}

// ======================================================
// Parse Tool Result
// ======================================================

function parseToolResult(message: ToolMessage): ParsedToolResult | null {
  try {
    const content = message.content;

    const text =
      typeof content === "string" ? content : JSON.stringify(content);

    return JSON.parse(text) as ParsedToolResult;
  } catch {
    return null;
  }
}

// ======================================================
// Find Tool Name
// ======================================================

function findToolName(
  state: PAAgentState,
  toolMessage: ToolMessage,
): string | null {
  if (!toolMessage.tool_call_id) {
    return null;
  }

  for (const message of state.messages) {
    if (!AIMessage.isInstance(message)) {
      continue;
    }

    const toolCall = message.tool_calls?.find(
      (call) => call.id === toolMessage.tool_call_id,
    );

    if (toolCall) {
      return toolCall.name;
    }
  }

  return null;
}

// ======================================================
// Empty Result Guidance
// ======================================================

function getEmptyResultGuidance(toolName: string): string {
  switch (toolName) {
    case "search_ehr_notes":
      return [
        "The EHR search returned no useful evidence.",
        "",
        "Do NOT conclude that conservative therapy was not completed yet.",
        "",
        "Try a concise clinical search term instead of a long combined query.",
        "",
        "Suggested EHR search terms:",
        "- physical therapy",
        "- PT",
        "- physiotherapy",
        "- chiropractic",
        "- acupuncture",
        "- home exercise",
        "- therapeutic exercise",
        "",
        "Start with the most directly relevant term:",
        "physical therapy",
        "",
        "Only consider evidence relevant to the condition and body part",
        "associated with the prior authorization request.",
      ].join("\n");

    case "search_pharmacy_records":
      return [
        "The pharmacy search returned no useful evidence.",
        "",
        "Consider another medication category if clinically relevant:",
        "- NSAID",
        "- Pain Medication",
        "- Anti-inflammatory",
        "- Analgesic",
        "- Muscle Relaxant",
        "",
        "Remember:",
        "Medication history alone does not prove completion of",
        "6 weeks of conservative therapy.",
      ].join("\n");

    case "search_imaging_history":
      return [
        "The imaging search returned no useful evidence.",
        "",
        "For the lumbar imaging criterion, search specifically for:",
        "- Lumbar Spine",
        "- Lumbar X-ray",
        "- Lumbar Spine X-ray",
        "- Lumbar radiograph",
        "",
        "Do not treat imaging from another body part as qualifying",
        "evidence for the lumbar MRI authorization.",
      ].join("\n");

    default:
      return [
        "The previous tool returned no useful evidence.",
        "",
        "Try a different search strategy.",
        "Do not repeat the same search with identical parameters.",
      ].join("\n");
  }
}

// ======================================================
// Duplicate Tool Detection
// ======================================================

function findDuplicateToolCall(state: PAAgentState): string | null {
  const aiMessages = state.messages.filter(AIMessage.isInstance);

  const calls = aiMessages.flatMap((message) => message.tool_calls ?? []);

  if (calls.length < 2) {
    return null;
  }

  const latestCall = calls.at(-1);

  if (!latestCall) {
    return null;
  }

  const latestArgs = JSON.stringify(latestCall.args);

  const duplicate = calls
    .slice(0, -1)
    .some(
      (call) =>
        call.name === latestCall.name &&
        JSON.stringify(call.args) === latestArgs,
    );

  return duplicate ? latestCall.name : null;
}

// import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

// import { PAAgentState } from "@/lib/schemas/state";

// interface ParsedToolResult {
//   success: boolean;
//   results: unknown[];
//   message?: string;
// }

// export async function reflectNode(
//   state: PAAgentState,
// ): Promise<Partial<PAAgentState>> {
//   const messages = [...state.messages];

//   const lastMessage = messages.at(-1);

//   if (!lastMessage || !ToolMessage.isInstance(lastMessage)) {
//     return {};
//   }

//   let parsed: ParsedToolResult | null = null;

//   try {
//     parsed = JSON.parse(lastMessage.text) as ParsedToolResult;
//   } catch {
//     return {};
//   }

//   // ------------------------------------
//   // Empty Result Detection
//   // ------------------------------------

//   if (!parsed.success || parsed.results.length === 0) {
//     messages.push(
//       new HumanMessage(
//         [
//           "The previous tool returned no useful evidence.",
//           "",
//           "Consider using another information source:",
//           "- EHR Notes",
//           "- Pharmacy Records",
//           "- Imaging History",
//           "",
//           "Avoid repeating the same search.",
//         ].join("\n"),
//       ),
//     );
//   }

//   // ------------------------------------
//   // Duplicate Tool Detection
//   // ------------------------------------

//   const aiMessages = state.messages.filter(AIMessage.isInstance);

//   if (aiMessages.length >= 2) {
//     const latest = aiMessages.at(-1)!;
//     const previous = aiMessages.at(-2)!;

//     const latestCall = latest.tool_calls?.[0];
//     const previousCall = previous.tool_calls?.[0];

//     if (
//       latestCall &&
//       previousCall &&
//       latestCall.name === previousCall.name &&
//       JSON.stringify(latestCall.args) === JSON.stringify(previousCall.args)
//     ) {
//       messages.push(
//         new HumanMessage(
//           [
//             "Warning:",
//             "",
//             "The same tool was called with identical parameters twice.",
//             "",
//             "Do NOT repeat this search.",
//             "Choose another tool or produce a final conclusion.",
//           ].join("\n"),
//         ),
//       );
//     }
//   }

//   return {
//     messages: messages.slice(state.messages.length),
//   };
// }
