import { IPriorAuthService } from "@/lib/interfaces/IServices/IPriorAuthServices";
import { SessionUser } from "@/types/users.dto";
import { paGraph as graph } from "@/lib/graph/graph";
import { embedQuery, toBullets } from "@/lib/policy/retrieve-policy-rules";
import { PAAgentState, PriorAuthResponse } from "@/types/agentState.dto";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { getPatientDataRepository } from "@/di/reposetriesDiI";
import prismaClient from "@/lib/prisma";
import { ExecutionStep, PolicyRetrievalResult } from "@/types/tools.dto";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { buildCriteria } from "@/lib/utils/MapResponse";

export class PriorAuthServices implements IPriorAuthService {
  private repository: IPatientDataRepository;

  constructor() {
    this.repository = getPatientDataRepository();
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

      const patient = await this.repository.getPatientByIdAsync(
        patientId,
        orgId,
      );
      console.log(`patient data retrive: ${patient}`);

      if (!patient) {
        throw new Error(`Patient '${patientId}' not found.`);
      }

      // Pre-Agent Fetcher (RAG): Backend retrieves policy; the agent never searches the policy manual.
      // const policy = await retrievePolicyRules({
      //   procedure: patient.procedureName,
      //   insurance: patient.insurancePayer,
      //   cpt_code: patient.procedureCode,
      //   maxBullets: 4,
      // });
      const policy = await this.retrievePolicyRules(
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

  async retrievePolicyRules(
    procedure: string,
    insurance: string,
    cpt_code?: string,
    maxBullets?: number,
  ): Promise<PolicyRetrievalResult | null> {
    try {
      maxBullets = maxBullets ? maxBullets : 5;
      const queryText = [
        `prior authorization medical necessity criteria for ${procedure}`,
        `insurance ${insurance}`,
        cpt_code ? `CPT ${cpt_code}` : "",
      ]
        .filter(Boolean)
        .join(" ");

      const queryEmbedding = await embedQuery(queryText);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;

      // pgvector cosine distance: smaller = more similar
      // 1 - cosine_distance ≈ cosine similarity when using vector_cosine_ops
      const rows = await prismaClient.$queryRawUnsafe<
        Array<{
          content: string;
          insurance: string | null;
          procedure: string | null;
          source_file: string | null;
          distance: number;
        }>
      >(
        `
        SELECT content, insurance, procedure, source_file, (embedding <=> $1::vector) AS distance
        FROM policy_chunks ORDER BY embedding <=> $1::vector LIMIT 8`,
        vectorLiteral,
      );

      // Light metadata boost
      const scored = rows.map((r) => {
        let score = 1 - Number(r.distance);
        if (r.insurance?.toLowerCase().includes(insurance.toLowerCase()))
          score += 0.25;
        if (cpt_code && r.content.includes(cpt_code)) score += 0.2;
        if (
          r.procedure
            ?.toLowerCase()
            .includes(procedure.toLowerCase().split(" ")[0] ?? "")
        ) {
          score += 0.15;
        }
        return { ...r, score };
      });

      scored.sort((a, b) => b.score - a.score);

      const rules: string[] = [];
      const sources = new Set<string>();

      for (const row of scored) {
        if (rules.length >= maxBullets) break;
        const bullets = toBullets(row.content, maxBullets - rules.length);
        for (const b of bullets) {
          if (rules.length >= maxBullets) break;
          if (!rules.some((r) => r.includes(b.slice(0, 40)))) {
            rules.push(b);
            if (row.source_file) sources.add(row.source_file);
          }
        }
      }
      console.log(`data retrival function excuted!`);
      return {
        insurance,
        procedure,
        cpt_code,
        rules,
        sourceFiles: [...sources],
      };
    } catch (error) {
      console.error(`Error in the retrival function excuttions: ${error}`);
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
}
