import { START, END, StateGraph } from "@langchain/langgraph";

import { PAAgentStateAnnotation } from "@/lib/schemas/state";
// import { PAAgentState } from "../schemas/state";

import { reasonerNode } from "./nodes/reasoner";
import { toolExecutorNode } from "./nodes/tool-executor";
import { reflectNode } from "./nodes/reflect";
import { formatterNode } from "./nodes/formatter";

import { shouldContinue } from "./conditions";

const workflow = new StateGraph(PAAgentStateAnnotation)

  // -----------------------------
  // Nodes
  // -----------------------------
  .addNode("reasoner", reasonerNode)
  .addNode("toolExecutor", toolExecutorNode)
  .addNode("reflect", reflectNode)
  .addNode("formatter", formatterNode)

  // -----------------------------
  // Entry Point
  // -----------------------------
  .addEdge(START, "reasoner")

  // -----------------------------
  // Conditional routing
  // -----------------------------
  .addConditionalEdges("reasoner", shouldContinue, {
    toolExecutor: "toolExecutor",
    formatter: "formatter",
    [END]: END,
  })

  // -----------------------------
  // Tool execution
  // -----------------------------
  .addEdge("toolExecutor", "reflect")

  // -----------------------------
  // Reflection
  // -----------------------------
  .addEdge("reflect", "reasoner")

  // -----------------------------
  // Final output
  // -----------------------------
  .addEdge("formatter", END);

export const paGraph = workflow.compile();
