import { ShieldCheck, Activity, FileSearch, BrainCircuit } from "lucide-react";

export default function ReactLoop() {
  return (
    <section
      id="how-it-works"
      className="py-20 bg-white dark:bg-slate-900 transition-colors duration-200"
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">The ReAct Loop in Action</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AuthGuardian does not just guess. It utilizes a structured Reasoning
            and Acting (ReAct) loop to systematically gather clinical evidence.
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
              className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50 hover:shadow-md dark:hover:bg-slate-800 transition"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
