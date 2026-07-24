import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";

import { PAAgentState } from "@/lib/schemas/state";

interface ParsedToolResult {
  success: boolean;
  results: unknown[];
  message?: string;
}

export async function reflectNode(
  state: PAAgentState,
): Promise<Partial<PAAgentState>> {
  const messages = [...state.messages];

  const lastMessage = messages.at(-1);

  if (!lastMessage || !ToolMessage.isInstance(lastMessage)) {
    return {};
  }

  let parsed: ParsedToolResult | null = null;

  try {
    parsed = JSON.parse(lastMessage.text) as ParsedToolResult;
  } catch {
    return {};
  }

  // ------------------------------------
  // Empty Result Detection
  // ------------------------------------

  if (!parsed.success || parsed.results.length === 0) {
    messages.push(
      new HumanMessage(
        [
          "The previous tool returned no useful evidence.",
          "",
          "Consider using another information source:",
          "- EHR Notes",
          "- Pharmacy Records",
          "- Imaging History",
          "",
          "Avoid repeating the same search.",
        ].join("\n"),
      ),
    );
  }

  // ------------------------------------
  // Duplicate Tool Detection
  // ------------------------------------

  const aiMessages = state.messages.filter(AIMessage.isInstance);

  if (aiMessages.length >= 2) {
    const latest = aiMessages.at(-1)!;
    const previous = aiMessages.at(-2)!;

    const latestCall = latest.tool_calls?.[0];
    const previousCall = previous.tool_calls?.[0];

    if (
      latestCall &&
      previousCall &&
      latestCall.name === previousCall.name &&
      JSON.stringify(latestCall.args) === JSON.stringify(previousCall.args)
    ) {
      messages.push(
        new HumanMessage(
          [
            "Warning:",
            "",
            "The same tool was called with identical parameters twice.",
            "",
            "Do NOT repeat this search.",
            "Choose another tool or produce a final conclusion.",
          ].join("\n"),
        ),
      );
    }
  }

  return {
    messages: messages.slice(state.messages.length),
  };
}
