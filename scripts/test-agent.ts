// import patients from "@/lib/mocks/patients.json";
import patients from "@/mocks/patients.json";
import { paGraph } from "@/lib/graph/graph";
import { PAAgentState } from "@/lib/schemas/state";
import { AIMessage, ToolMessage, HumanMessage } from "@langchain/core/messages";

async function main() {
  const patient = patients[0];

  const initialState: PAAgentState = {
    patientDetails: {
      patientId: patient.patientId,
      procedureCode: "72148",
      procedureName: "MRI Lumbar Spine Without Contrast",
      diagnosisCode: "M54.5",
      insurancePayer: "Blue Cross Blue Shield",
    },

    policyRules: [
      "Patient must complete at least 6 weeks of conservative therapy.",
      "Lumbar X-ray must exist within 90 days.",
    ],

    gatheredEvidence: [],

    iterationCount: 0,

    status: "in_progress",

    messages: [],
  };

  console.log("====================================");
  console.log("Running Prior Authorization Agent");
  console.log("====================================");

  console.log();

  console.log("Patient:");

  console.log(patient.patientId);

  console.log();

  const result = await paGraph.invoke(initialState);

  console.log("====================================");

  console.log("Final State");

  console.log("====================================");

  //   console.dir(result, {
  //     depth: null,
  //     colors: true,
  //   });
  for (const message of result.messages) {
    if (AIMessage.isInstance(message)) {
      if (message.tool_calls?.length) {
        console.log("🤖 Reasoner");

        for (const tool of message.tool_calls) {
          console.log(`  → ${tool.name}`);
          console.log(tool.args);
        }
      } else if (message.text) {
        console.log("🤖 Final Reasoning");
        console.log(message.text);
      }
    }

    if (ToolMessage.isInstance(message)) {
      console.log(`🔧 ${message.name}`);

      const response = JSON.parse(message.text);

      console.log(response);
    }

    if (HumanMessage.isInstance(message)) {
      console.log("💭 Reflection");
      console.log(message.text);
    }
  }
}

main().catch(console.error);
