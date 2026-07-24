import { AIMessage, ToolMessage } from "@langchain/core/messages";

import { PAAgentState } from "@/lib/schemas/state";

import { search_ehr_notes } from "@/lib/tools/EHRNotes";
import { search_pharmacy_records } from "@/lib/tools/PharmacyRecords";
import { search_imaging_history } from "@/lib/tools/ImagingHistory";

// Define the record explicitly to avoid deep generic inference issues
const toolsByName: Record<string, any> = {
  [search_ehr_notes.name]: search_ehr_notes,
  [search_pharmacy_records.name]: search_pharmacy_records,
  [search_imaging_history.name]: search_imaging_history,
};

interface ToolResult {
  success: boolean;
  patientId: string;
  results: Array<{
    date: string;
    text?: string;
    report?: string;
    medication?: string;
  }>;
  message?: string;
}

export async function toolExecutorNode(
  state: PAAgentState,
): Promise<Partial<PAAgentState>> {
  const lastMessage = state.messages.at(-1);

  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return {};
  }

  const toolMessages: ToolMessage[] = [];

  // Explicitly type the array to match your PAAgentState's expected gatheredEvidence
  const gatheredEvidence: NonNullable<PAAgentState["gatheredEvidence"]> = [];

  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsByName[toolCall.name];

    if (!tool) {
      continue;
    }

    // Fix 1: Cast tool.invoke to any to bypass incompatible generic signatures in the tool union
    const observation = await tool.invoke(toolCall);

    toolMessages.push(observation);

    let parsed: ToolResult;

    try {
      parsed = JSON.parse(observation.text) as ToolResult;
    } catch {
      continue;
    }

    if (!parsed.success) {
      continue;
    }

    gatheredEvidence.push(
      ...parsed.results.map((item) => ({
        sourceType: mapToolToSource(toolCall.name),
        dateFound: item.date,
        // Fix 2: Explicitly cast the literal union type so it isn't widened to 'string'
        status: (item.text || item.report || item.medication
          ? "Met"
          : "Unclear") as "Met" | "Unclear" | "Not Met",
        snippetText: item.text ?? item.report ?? item.medication ?? "",
      })),
    );
  }

  return {
    messages: toolMessages,
    gatheredEvidence,
    iterationCount: state.iterationCount + 1,
  };
}

function mapToolToSource(toolName: string): "EHR" | "Pharmacy" | "Imaging" {
  switch (toolName) {
    case "search_ehr_notes":
      return "EHR";

    case "search_pharmacy_records":
      return "Pharmacy";

    case "search_imaging_history":
      return "Imaging";

    default:
      return "EHR";
  }
}
