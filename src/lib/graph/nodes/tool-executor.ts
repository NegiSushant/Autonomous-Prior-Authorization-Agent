import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { PAAgentState } from "@/lib/schemas/state";
import { search_ehr_notes } from "@/lib/tools/EHRNotes";
import { search_pharmacy_records } from "@/lib/tools/PharmacyRecords";
import { search_imaging_history } from "@/lib/tools/ImagingHistory";

interface ToolResult {
  success: boolean;
  patientId?: string;
  results: Array<{
    documentId: string;
    date: string;
    text?: string;
    report?: string;
    medication?: string;
  }>;
  message?: string;
  error?: string;
}

interface ToolErrorResult {
  success: false;
  patientId?: string;
  results: [];
  message: string;
  error: string;
  tool: string;
}

export async function toolExecutorNode(
  state: PAAgentState,
): Promise<Partial<PAAgentState>> {
  const lastMessage = state.messages.at(-1);
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return {};
  }
  const toolMessages: ToolMessage[] = [];
  const gatheredEvidence: NonNullable<PAAgentState["gatheredEvidence"]> = [];
  // Execute requested tools
  for (const toolCall of lastMessage.tool_calls ?? []) {
    try {
      switch (toolCall.name) {
        // EHR
        case "search_ehr_notes": {
          const observation = await search_ehr_notes.invoke(toolCall);
          toolMessages.push(observation);
          processToolResult(observation, toolCall.name, gatheredEvidence);
          break;
        }
        // Pharmacy
        case "search_pharmacy_records": {
          const observation = await search_pharmacy_records.invoke(toolCall);
          toolMessages.push(observation);
          processToolResult(observation, toolCall.name, gatheredEvidence);
          break;
        }
        // Imaging
        case "search_imaging_history": {
          const observation = await search_imaging_history.invoke(toolCall);
          toolMessages.push(observation);
          processToolResult(observation, toolCall.name, gatheredEvidence);
          break;
        }
        // Unknown tool
        default: {
          const unknownToolResult: ToolErrorResult = {
            success: false,
            patientId: state.patientDetails.patientId,
            results: [],
            message: `Unknown tool: ${toolCall.name}`,
            error: "UNKNOWN_TOOL",
            tool: toolCall.name,
          };

          toolMessages.push(
            new ToolMessage({
              tool_call_id: toolCall.id ?? "",
              content: JSON.stringify(unknownToolResult),
            }),
          );
          break;
        }
      }
    } catch (error) {
      // TOOL ERROR HANDLING
      // IMPORTANT: A tool failure must NOT crash the graph.
      const errorMessage = getToolErrorMessage(error);
      const toolError: ToolErrorResult = {
        success: false,
        patientId: state.patientDetails.patientId,
        results: [],
        message: "Tool API Timeout",
        error: errorMessage,
        tool: toolCall.name,
      };

      toolMessages.push(
        new ToolMessage({
          tool_call_id: toolCall.id ?? "",
          content: JSON.stringify(toolError),
        }),
      );
    }
  }

  // Combine existing + newly collected evidence
  const allEvidence = [...state.gatheredEvidence, ...gatheredEvidence];
  // Detect conflicting evidence
  const conflicts = detectConflicts(allEvidence);
  // Return updated state
  return {
    messages: toolMessages,
    gatheredEvidence,
    conflicts,
    iterationCount: state.iterationCount + 1,
  };
}

// Process successful tool result
function processToolResult(
  observation: ToolMessage,
  toolName: string,
  gatheredEvidence: NonNullable<PAAgentState["gatheredEvidence"]>,
): void {
  let parsed: ToolResult;
  try {
    parsed = JSON.parse(observation.text) as ToolResult;
  } catch {
    return;
  }
  // Tool itself returned failure.
  if (!parsed.success) {
    return;
  }
  // No evidence returned.
  if (!Array.isArray(parsed.results)) {
    return;
  }

  const newEvidence = parsed.results.map((item) => ({
    sourceType: mapToolToSource(toolName),
    documentId: item.documentId,
    dateFound: item.date,
    status: (item.text || item.report || item.medication
      ? "Met"
      : "Unclear") as "Met" | "Unclear" | "Not Met",

    snippetText: item.text ?? item.report ?? item.medication ?? "",
  }));
  gatheredEvidence.push(...newEvidence);
}

// Map tool → evidence source
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


// Convert unknown caught error into a safe message
function getToolErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown tool execution error";
}

// Conflict detection
function detectConflicts(evidence: PAAgentState["gatheredEvidence"]): string[] {
  const conflicts: string[] = [];

  const ehrEvidence = evidence.filter((item) => item.sourceType === "EHR");

  const refusedPhysicalTherapy = ehrEvidence.some((item) =>
    item.snippetText.toLowerCase().includes("refused physical therapy"),
  );

  const completedPhysicalTherapy = ehrEvidence.some((item) =>
    item.snippetText
      .toLowerCase()
      .includes("completed 6 weeks of physical therapy"),
  );

  if (refusedPhysicalTherapy && completedPhysicalTherapy) {
    conflicts.push(
      "Conflicting EHR documentation regarding physical therapy: one note states that physical therapy was refused, while another states that 6 weeks of physical therapy were completed.",
    );
  }

  return conflicts;
}