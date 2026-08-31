import { llm } from "@/lib/agents/openaiLLM";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { REASONER_SYSTEM_PROMPT } from "@/lib/prompts/reasoner";
import { PAAgentState } from "@/types/agentState.dto";
import { search_ehr_notes } from "@/lib/tools/EHRNotes";
import { search_imaging_history } from "@/lib/tools/ImagingHistory";
import { search_pharmacy_records } from "@/lib/tools/PharmacyRecords";

const reasonerLLM = llm.bindTools([
  search_ehr_notes,
  search_pharmacy_records,
  search_imaging_history,
]);

export async function reasonerNode(
  state: PAAgentState,
): Promise<Partial<PAAgentState>> {
  const prompt = `Patient ${JSON.stringify(state.patientDetails, null, 2)}
                  ---
                  Policy Rules
                  ${state.policyRules.join("\n")}
                  ---
                  Evidence Collected
                  ${JSON.stringify(state.gatheredEvidence, null, 2)}
                  ----
                  Current Status
                  ${state.status}`;

  const response = await reasonerLLM.invoke([
    new SystemMessage(REASONER_SYSTEM_PROMPT),
    ...state.messages,
    new HumanMessage(prompt),
  ]);

  return {
    messages: [response],
  };
}

// import { llm } from "@/lib/agents/openaiLLM";
// import { REASONER_SYSTEM_PROMPT } from "@/lib/prompts/reasoner";
// import { PAAgentState } from "@/lib/schemas/state";
// import { search_ehr_notes } from "@/lib/tools/EHRNotes";
// import { search_imaging_history } from "@/lib/tools/ImagingHistory";
// import { search_pharmacy_records } from "@/lib/tools/PharmacyRecords";
// import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// const reasonerLLM = llm.bindTools([
//   search_ehr_notes,
//   search_pharmacy_records,
//   search_imaging_history,
// ]);

// export async function reasonerNode(
//   state: PAAgentState,
// ): Promise<Partial<PAAgentState>> {
//   const prompt = `Patient ${JSON.stringify(state.patientDetails, null, 2)}
//                   ---
//                   Policy Rules
//                   ${state.policyRules.join("\n")}
//                   ---
//                   Evidence Collected
//                   ${JSON.stringify(state.gatheredEvidence, null, 2)}
//                   ----
//                   Current Status
//                   ${state.status}`;

//   const response = await reasonerLLM.invoke([
//     new SystemMessage(REASONER_SYSTEM_PROMPT),
//     ...state.messages,
//     new HumanMessage(prompt),
//   ]);

//   return {
//     messages: [response],
//   };
// }
