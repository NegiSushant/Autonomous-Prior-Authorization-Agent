import { PAAgentState } from "@/lib/schemas/state";
import { SessionUser } from "@/types/users.dto";

export interface IPriorAuthService {
  executePriorAuthorization(
    patientId: number,
    session: SessionUser,
  ): Promise<PAAgentState | null>;

  retrievePolicyRules(params: {
    procedure: string;
    insurance: string;
    cpt_code?: string;
    maxBullets?: number;
  }): Promise<PolicyRetrievalResult>
}
