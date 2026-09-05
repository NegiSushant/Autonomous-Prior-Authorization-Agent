import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { IPriorAuthService } from "@/lib/interfaces/IServices/IPriorAuthServices";
import { SessionUser } from "@/types/users.dto";
import { paGraph as graph } from "@/lib/graph/graph";
import { PAAgentState, PriorAuthResponse } from "@/types/agentState.dto";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import {
  getAgentRAGRepository,
  getPatientDataRepository,
} from "@/di/reposetriesDiI";
import { ExecutionStep } from "@/types/tools.dto";
import { buildCriteria } from "@/lib/utils/MapResponse";
import { IAgentsDataRepository } from "@/lib/interfaces/IRepository/IAgentsDataRepository";
import { IEmbeddingServices } from "@/lib/interfaces/IServices/IEmbeddingServices";
import { getEmbeddingService } from "@/di/servicesDil";

export class PriorAuthServices implements IPriorAuthService {
  private patientRepository: IPatientDataRepository;
  private agentDataRepository: IAgentsDataRepository;
  private embeddingServices: IEmbeddingServices;

  constructor() {
    this.patientRepository = getPatientDataRepository();
    this.agentDataRepository = getAgentRAGRepository();
    this.embeddingServices = getEmbeddingService();
  }

  async executePriorAuthorization(
    patientId: number,
    session: SessionUser,
  ): Promise<PAAgentState | null> {
    try {
      // const patient = patients.find((p) => p.patientId === patientId);
      let orgId: number | null = null;
      if (session.role === "REVIEWER" || session.role === "ADMIN") {
        orgId = session.orgId;
      }

      const patient = await this.patientRepository.getPatientByIdAsync(
        patientId,
        orgId,
      );
      console.log(`patient data retrive: ${patient}`);

      if (!patient) {
        throw new Error(`Patient '${patientId}' not found.`);
      }

      // Pre-Agent Fetcher (RAG): Backend retrieves policy; the agent never searches the policy manual.
      const policy = await this.embeddingServices.retrievePolicyRules(
        patient.procedureName,
        patient.insurancePayer,
        patient.procedureCode,
        5,
      );

      console.log("[Phase 9] Policy sources:", policy?.sourceFiles);
      console.log("[Phase 9] Injected rules:", policy?.rules);

      if (!policy) {
        return null;
      }

      const initialState: PAAgentState = {
        patientDetails: {
          patientId: patient.id,
          procedureCode: patient.procedureCode,
          procedureName: patient.procedureName,
          diagnosisCode: patient.diagnosisCode,
          insurancePayer: patient.insurancePayer,
        },

        // Only the 3–4 retrieved bullets (not the full hardcoded policy)
        policyRules:
          policy.rules.length > 0
            ? policy.rules
            : [
                // Safe fallback if retrieval returns nothing
                "• No matching policy criteria were retrieved. Flag for manual review.",
              ],

        gatheredEvidence: [],
        conflicts: [],
        iterationCount: 0,
        status: "in_progress",
        messages: [],
      };

      const result = await graph.invoke(initialState);
      console.log(`graph invoked: ${result}`);
      return result;
    } catch (error) {
      console.error(
        `Failed in the executePriorAuthorization function excution: ${error}`,
      );
      return null;
    }
  }

  async mapAgentResponse(
    state: PAAgentState,
  ): Promise<PriorAuthResponse | null> {
    try {
      const executionTrace: ExecutionStep[] = [];
      const recommendation =
        state.finalReport?.recommendationStatus ?? "Unknown";
      // BUILD EXECUTION TRACE
      for (const message of state.messages) {
        // AI MESSAGE
        if (AIMessage.isInstance(message)) {
          const toolCalls = message.tool_calls ?? [];
          // Agent requested tools
          if (toolCalls.length > 0) {
            executionTrace.push({
              type: "reasoner",
              title: "Reasoning",
              content:
                message.text || "Agent decided to invoke one or more tools.",
            });

            for (const toolCall of toolCalls) {
              executionTrace.push({
                type: "tool",
                title: "Tool Invocation",
                content: toolCall.name,
                toolName: toolCall.name,
                toolArguments: toolCall.args,
              });
            }
          }
          // Agent produced final response
          else {
            const content = message.text || "";
            // recommendation = content;
            executionTrace.push({
              type: "reasoner",
              title: "Final Recommendation",
              content,
            });
          }
          continue;
        }
        // TOOL MESSAGE
        if (ToolMessage.isInstance(message)) {
          let parsedResult: unknown = message.content;
          try {
            if (typeof message.content === "string") {
              parsedResult = JSON.parse(message.content);
            }
          } catch {
            // Keep raw content if it is not valid JSON.
          }
          executionTrace.push({
            type: "tool",
            title: "Tool Result",
            content: message.name ?? "Tool Result",
            toolName: message.name,
            toolResult: parsedResult,
          });
          continue;
        }
        // HUMAN MESSAGE: Reflect node uses HumanMessage to inject guidance back into the Reasoner.
        if (HumanMessage.isInstance(message)) {
          executionTrace.push({
            type: "reflection",
            title: "Reflection",
            content: message.text,
          });
        }
      }
      // BUILD CRITERIA EVALUATION
      const criteria = buildCriteria(state);
      // FINAL RESPONSE
      console.log(`Agent response maped success fully!`);
      return {
        patientId: state.patientDetails.patientId,
        status: state.status,
        recommendation,
        criteria,
        gatheredEvidence: state.gatheredEvidence,
        executionTrace,
      };
    } catch (error) {
      console.error(`error while maping agent response: ${error}`);
      return null;
    }
  }

  async storeAgentResponse(state: PriorAuthResponse): Promise<boolean> {
    try {
      const isAgentResponseSave =
        await this.agentDataRepository.storeAgentResponse(state);
      if (!isAgentResponseSave) return false;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
