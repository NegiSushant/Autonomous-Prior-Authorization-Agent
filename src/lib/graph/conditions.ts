import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { END } from "@langchain/langgraph";
import { PAAgentState } from "@/types/agentState.dto";

export const MAX_ITERATIONS = 5;

/**
 * Determines whether the graph should:
 * - execute tools
 * - continue reasoning
 * - finish and format the report
 */
export function shouldContinue(
  state: PAAgentState,
): "toolExecutor" | "reflect" | "formatter" | typeof END {
  // Conflict has highest priority.
  if (state.conflicts.length > 0) {
    return "formatter";
  }
  // Prevent infinite loops
  if (state.iterationCount >= MAX_ITERATIONS) {
    return "formatter";
  }
  const lastMessage = state.messages.at(-1);
  if (!lastMessage) {
    return END;
  }

  // AI requested tool(s)
  if (
    AIMessage.isInstance(lastMessage) &&
    (lastMessage.tool_calls?.length ?? 0) > 0
  ) {
    return "toolExecutor";
  }

  // Tool execution completed
  if (ToolMessage.isInstance(lastMessage)) {
    return "reflect";
  }

  // AI produced a final answer
  if (
    AIMessage.isInstance(lastMessage) &&
    (lastMessage.tool_calls?.length ?? 0) === 0
  ) {
    return "formatter";
  }
  return END;
}
