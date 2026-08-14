import { Activity, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <header className="px-8 py-24 mx-auto max-w-6xl text-center">
      <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold mb-6">
        <Activity size={16} />
        <span>The safest AI for Healthcare Administration</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
        Automate Prior Authorization <br />
        <span className="text-blue-600 dark:text-blue-500">
          Without Compromising Safety.
        </span>
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
        Stop manually digging through unstructured EHRs. Our bounded AI
        orchestrator reads charts, checks payer policies, and builds verified
        evidence packets for your medical directors in minutes.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="bg-blue-600 dark:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition flex items-center shadow-lg shadow-blue-600/20 dark:shadow-blue-900/20">
          See the Agent in Action <ArrowRight className="ml-2" size={20} />
        </button>
        <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          Read the Whitepaper
        </button>
      </div>
    </header>
  );
}
