import { IPriorAuthService } from "@/lib/interfaces/IServices/IPriorAuthServices";
import { SessionUser } from "@/types/users.dto";
import { paGraph as graph } from "@/lib/graph/graph";
import { retrievePolicyRules } from "@/lib/policy/retrieve-policy-rules";
import { PAAgentState } from "@/types/agentState.dto";
import { IPatientDataRepository } from "@/lib/interfaces/IRepository/IPatientDataRepository";
import { getPatientDataRepository } from "@/di/reposetriesDiI";

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

      if (!patient) {
        throw new Error(`Patient '${patientId}' not found.`);
      }

      // Pre-Agent Fetcher (RAG): Backend retrieves policy; the agent never searches the policy manual.
      const policy = await retrievePolicyRules({
        procedure: patient.procedureName,
        insurance: patient.insurancePayer,
        cpt_code: patient.procedureCode,
        maxBullets: 4,
      });

      console.log("[Phase 9] Policy sources:", policy.sourceFiles);
      console.log("[Phase 9] Injected rules:", policy.rules);

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
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
