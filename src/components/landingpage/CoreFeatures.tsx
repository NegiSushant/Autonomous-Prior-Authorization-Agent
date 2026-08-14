import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";

export default function CoreFeatures() {
  return (
    <section
      id="safety"
      className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200"
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Strictly Bounded. <br />
              Clinically Safe.
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8">
              In healthcare, hallucinations and infinite AI loops are dangerous.
              AuthGuardian is architected around strict state tracking and
              iteration limits.
            </p>

            <ul className="space-y-6">
              <li className="flex items-start">
                <Clock className="text-blue-600 dark:text-blue-400 mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    Iteration Limits
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Agent search logic is hard-capped to prevent infinite loops.
                    Conserves compute and guarantees response times.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="text-amber-500 dark:text-amber-400 mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    Graceful Degradation
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    If evidence is missing, the agent does not crash or
                    auto-deny. It compiles a Pending Request report for human
                    intervention.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400 mr-4 mt-1 shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    Never Auto-Denies
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    Humans make the final call. The AI acts purely as an
                    extremely fast, thorough paralegal for medical charts.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Mock UI Terminal / Dashboard */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl">
            <div className="flex space-x-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="font-mono text-sm space-y-3">
              <p className="text-slate-400">{`> Initiating Chart Review: Patient ID #99281`}</p>
              <p className="text-blue-400">{`> Agent.Think(): Checking Cigna policy for Lumbar MRI.`}</p>
              <p className="text-slate-400">{`> Agent.Act(): Querying read-only FHIR endpoint for PT encounters...`}</p>
              <p className="text-amber-400">{`> Reflection: PT notes not found. Self-correcting search strategy.`}</p>
              <p className="text-slate-400">{`> Agent.Act(): Querying pharmacy dispenses for NSAIDs...`}</p>
              <p className="text-emerald-400">{`> Success: Found 3 months continuous Meloxicam script.`}</p>
              <p className="text-white mt-4 border-t border-slate-700 pt-4">{`✓ Evidence Packet Assembled. Ready for Medical Director Sign-off.`}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
