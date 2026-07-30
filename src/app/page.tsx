import {
  ShieldCheck,
  Activity,
  Clock,
  FileSearch,
  BrainCircuit,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <header className="px-8 py-24 mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
          <Activity size={16} />
          <span>The safest AI for Healthcare Administration</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          Automate Prior Authorization <br />
          <span className="text-blue-600">Without Compromising Safety.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Stop manually digging through unstructured EHRs. Our bounded AI
          orchestrator reads charts, checks payer policies, and builds verified
          evidence packets for your medical directors in minutes.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex items-center shadow-lg shadow-blue-600/20">
            See the Agent in Action <ArrowRight className="ml-2" size={20} />
          </button>
          <button className="bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
            Read the Whitepaper
          </button>
        </div>
      </header>

      {/* How it Works - The ReAct Loop */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              The ReAct Loop in Action
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              AuthGuardian does not just guess. It utilizes a structured
              Reasoning and Acting (ReAct) loop to systematically gather
              clinical evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: "1. Observe",
                icon: <FileSearch />,
                desc: "Intercepts PA request for an expensive procedure (e.g., Lumbar MRI).",
              },
              {
                title: "2. Think",
                icon: <BrainCircuit />,
                desc: "Analyzes payer policy. Realizes patient needs 6 weeks of conservative therapy first.",
              },
              {
                title: "3. Act",
                icon: <Activity />,
                desc: "Executes bounded, read-only EHR queries targeting PT notes and pharmacy dispenses.",
              },
              {
                title: "4. Reflect",
                icon: <ShieldCheck />,
                desc: "Synthesizes found evidence into a verified packet for medical director review.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features & Safety Bounds */}
      <section id="safety" className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Strictly Bounded. <br />
                Clinically Safe.
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                In healthcare, hallucinations and infinite AI loops are
                dangerous. AuthGuardian is architected around strict state
                tracking and iteration limits.
              </p>

              <ul className="space-y-6">
                <li className="flex items-start">
                  <Clock className="text-blue-400 mr-4 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Iteration Limits</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Agent search logic is hard-capped to prevent infinite
                      loops. Conserves compute and guarantees response times.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="text-amber-400 mr-4 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Graceful Degradation</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      If evidence is missing, the agent does not crash or
                      auto-deny. It compiles a Pending Request report for human
                      intervention.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ShieldCheck className="text-emerald-400 mr-4 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg">Never Auto-Denies</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Humans make the final call. The AI acts purely as an
                      extremely fast, thorough paralegal for medical charts.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Mock UI Terminal / Dashboard */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl">
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
    </div>
  );
}
