import {
  Network,
  Database,
  BrainCircuit,
  ShieldAlert,
  ArrowRight,
  SearchX,
  CheckCircle2,
  Cpu,
  Workflow,
  ClipboardList,
} from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white font-sans pb-20 transition-colors duration-200">
      {/* Hero Section */}
      <header className="px-8 py-20 mx-auto max-w-5xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Architected for{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Clinical Reality.
          </span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          You cannot solve Prior Authorization with a basic Chatbot wrapper.
          Medical records are highly unstructured. Here is how our bounded ReAct
          agent dynamically navigates clinical charts without hallucinating.
        </p>
      </header>

      {/* The Problem vs Solution */}
      <section className="max-w-6xl mx-auto px-8 mb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Legacy Search */}
          <div className="p-8 rounded-2xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
            <div className="flex items-center space-x-3 mb-4 text-red-600 dark:text-red-400">
              <SearchX size={28} />
              <h3 className="text-2xl font-bold">Basic Keyword Search</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Fails when clinical language varies from the exact policy text.
            </p>
            <div className="p-4 rounded-lg font-mono text-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <p className="text-slate-700 dark:text-slate-300">
                Insurance Policy requires:
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                6 weeks of conservative therapy
              </p>
              <p className="mt-4 text-slate-700 dark:text-slate-300">
                {" "}
                Search query executed:
              </p>
              <p className="text-red-500 dark:text-red-400">{`SELECT * FROM notes WHERE text LIKE '%conservative therapy%'`}</p>
              <p className="text-red-600 dark:text-red-500 font-bold mt-2">
                Result: 0 records found. (Denial)
              </p>
            </div>
          </div>

          {/* ReAct Agent */}
          <div className="p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-white dark:bg-slate-900 shadow-lg shadow-blue-900/5 dark:shadow-none">
            <div className="flex items-center space-x-3 mb-4 text-blue-600 dark:text-blue-400">
              <BrainCircuit size={28} />
              <h3 className="text-2xl font-bold">The ReAct Agent</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Thinks, reflects, and pivots search strategies dynamically.
            </p>
            <div className="p-4 rounded-lg font-mono text-sm border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 space-y-2">
              <p className="text-blue-800 dark:text-blue-300">
                1. Observe: `conservative therapy` is missing.
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                2. Think: `Conservative therapy includes NSAIDs or Chiropractic
                care.`
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                3. Act:{" "}
                <span className="font-semibold px-1 text-blue-900 dark:text-blue-200">
                  Search_Pharmacy(`ibuprofen 800mg`)
                </span>
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center">
                <CheckCircle2 size={16} className="mr-1" /> Result: Found
                3-month prescription. (Approved)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The PoC Blueprint */}
      <section
        id="poc-blueprint"
        className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The PoC Blueprint
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              How to architect this deterministic system using a state graph and
              strict control boundaries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Component 1: State */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <Database
                className="text-blue-500 dark:text-blue-400 mb-4"
                size={32}
              />
              <h3 className="text-xl font-bold mb-2">1. The State (Memory)</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                The exact clipboard the agent carries through every loop
                iteration.
              </p>
              <ul className="text-xs space-y-2 font-mono p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                <li className="text-slate-800 dark:text-slate-300">{`{`}</li>
                <li className="text-slate-800 dark:text-slate-300">{`  patient_context: "Lumbar MRI",`}</li>
                <li className="text-slate-800 dark:text-slate-300">{`  policy_rules: [...],`}</li>
                <li className="text-slate-800 dark:text-slate-300">{`  evidence_gathered: [...],`}</li>
                <li className="text-amber-600 dark:text-amber-400">{`  iteration_count: 2`}</li>
                <li className="text-slate-800 dark:text-slate-300">{`}`}</li>
              </ul>
            </div>

            {/* Component 2: Tools */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <Cpu
                className="text-emerald-500 dark:text-emerald-400 mb-4"
                size={32}
              />
              <h3 className="text-xl font-bold mb-2">2. Mocked Tools</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                Read-only functions the agent can trigger to interact with the
                EHR.
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-2 rounded text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Search_Clinical_Notes()
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 p-2 rounded text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Search_Pharmacy_Records()
                </div>
              </div>
            </div>

            {/* Component 3: Prompt */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <ClipboardList
                className="text-purple-500 dark:text-purple-400 mb-4"
                size={32}
              />
              <h3 className="text-xl font-bold mb-2">3. ReAct Prompt</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                The central brain instructing the LLM on its persona and
                operational constraints.
              </p>
              <p className="text-xs italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border-l-2 border-purple-500 dark:border-purple-500">
                `You are a clinical abstraction agent... 1. Observe evidence. 2.
                Think what is missing. 3. Act by calling a search tool. 4.
                Reflect on the result.`
              </p>
            </div>

            {/* Component 4: Edges */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm">
              <Network
                className="text-rose-600 dark:text-rose-400 mb-4"
                size={32}
              />
              <h3 className="text-xl font-bold mb-2">4. Graph Edges</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                The rigid control flow that guarantees the agent is safe for
                enterprise use.
              </p>
              <ul className="text-sm space-y-3 text-slate-700 dark:text-slate-300">
                <li className="flex items-start">
                  <Workflow
                    size={16}
                    className="text-rose-500 dark:text-rose-400 mr-2 mt-1"
                  />
                  <span>
                    <strong>The Loop:</strong> Routes tool outputs back to LLM.
                  </span>
                </li>
                <li className="flex items-start">
                  <ShieldAlert
                    size={16}
                    className="text-rose-500 dark:text-rose-400 mr-2 mt-1"
                  />
                  <span>
                    <strong>Kill Switch:</strong> Forces exit if{" "}
                    <code className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-1 rounded">
                      count == 5
                    </code>
                    .
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visualizing the Graph Flow */}
      <section className="max-w-5xl mx-auto px-8 mt-24">
        <h2 className="text-3xl font-bold text-center mb-12">
          Control Flow Visualization
        </h2>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
          <div className="min-w-175 flex flex-col items-center space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-bold px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800/50">
              Start: Receive PA Request
            </div>

            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

            <div className="flex items-center w-full justify-center space-x-8">
              {/* Agent Node */}
              <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-xl w-64 text-center shadow-lg relative z-10 border border-slate-800">
                <BrainCircuit
                  className="mx-auto mb-2 text-blue-400"
                  size={32}
                />
                <h4 className="font-bold">LLM Brain Node</h4>
                <p className="text-xs text-slate-300 dark:text-slate-400 mt-2">
                  Evaluate State & Decide Next Action
                </p>
              </div>

              <div className="flex flex-col space-y-2 items-center">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-mono">
                  <span>Call Tool</span>
                  <ArrowRight size={16} className="mx-2" />
                </div>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-mono">
                  <ArrowRight size={16} className="mx-2 rotate-180" />
                  <span>Return Data</span>
                </div>
              </div>

              {/* Tools Node */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-xl w-64 text-center shadow-sm">
                <Database
                  className="mx-auto mb-2 text-emerald-600 dark:text-emerald-500"
                  size={32}
                />
                <h4 className="font-bold text-emerald-900 dark:text-emerald-400">
                  EHR Tools Node
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-2">
                  Execute Read-Only Queries
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

            {/* Condition Check */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-400 p-4 rounded-lg w-80 text-center font-mono text-sm">
              Conditional Check: Iteration &gt;= 5 OR Evidence Complete?
            </div>

            <div className="flex w-80 justify-between px-8 relative">
              <div className="absolute left-1/2 top-0 h-8 w-px bg-slate-300 dark:bg-slate-600 -translate-x-1/2"></div>
            </div>
            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600 mt-4"></div>

            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 font-bold px-6 py-4 rounded-xl border border-rose-200 dark:border-rose-800/50 text-center w-80 shadow-sm">
              <ShieldAlert
                className="mx-auto mb-2 text-rose-600 dark:text-rose-500"
                size={24}
              />
              Human Handoff
              <p className="text-xs font-normal mt-1 text-rose-700 dark:text-rose-500">
                Output Clinical Briefing (Never auto-deny)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
