import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { PAAgentState } from "../schemas/state";

export const PAStateAnnotation = Annotation.Root({
  patientDetails: Annotation<PAAgentState["patientDetails"]>({
    reducer: (_, update) => update,
  }),

  policyRules: Annotation<string[]>({
    reducer: (_, update) => update,
    default: () => [],
  }),

  gatheredEvidence: Annotation<PAAgentState["gatheredEvidence"]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),

  iterationCount: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  status: Annotation<PAAgentState["status"]>({
    reducer: (_, update) => update,
    default: () => "in_progress",
  }),

  messages: Annotation<BaseMessage[]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),
});

// import { Annotation } from "@langchain/langgraph";
// import { PAAgentState } from "../schemas/state";
// import { BaseMessage } from "@langchain/core/messages";

// export const PAStateAnnotation = Annotation.Root({
//   patientDetails: Annotation<PAAgentState["patientDetails"]>(),
//   policyRules: Annotation<string>(),
//   gatheredEvidence: Annotation<PAAgentState["gatheredEvidence"]>({
//     reducer: (state, update) => [...state, ...update],
//     default: () => [],
//   }),

//   iterationCount: Annotation<number>(),
//   satus: Annotation<PAAgentState["status"]>(),
//   messages: Annotation<BaseMessage[]>({
//     reducer: (state, update) => [...state, ...update],
//     default: () => [],
//   }),
// });
