import { Annotation } from "@langchain/langgraph";
import { PAAgentState } from "../schemas/state";
import { BaseMessage } from "@langchain/core/messages";

export const PAStateAnnotation = Annotation.Root({
  patientDetails: Annotation<PAAgentState["patientDetails"]>(),
  policyRules: Annotation<string>(),
  gatheredEvidence: Annotation<PAAgentState["gatheredEvidence"]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),

  iterationCount: Annotation<number>(),
  satus: Annotation<PAAgentState["status"]>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (state, update) => [...state, ...update],
    default: () => [],
  }),
});
