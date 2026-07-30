"use client";

import { motion } from "framer-motion";
import Workflow from "../landingpage/Workflow";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-225 h-225 rounded-full blur-[180px] bg-blue-700/20 -top-52 -left-52" />
        <div className="absolute w-150 h-150 rounded-full blur-[180px] bg-cyan-600/20 bottom-0 right-0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-blue-300 text-sm"
          >
            <ShieldCheck size={16} />
            Healthcare AI Orchestration Platform
          </motion.div>

          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-6xl lg:text-7xl font-black leading-tight"
          >
            Autonomous Prior Authorization
            <span className="block text-blue-400">with Explainable AI</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-xl leading-9 text-slate-300 max-w-xl"
          >
            AI agents investigate patient records, retrieve clinical evidence,
            validate payer policies, and prepare explainable prior authorization
            packets—keeping clinicians in complete control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-5 mt-10"
          >
            <button className="bg-blue-600 hover:bg-blue-500 px-7 py-4 rounded-xl flex items-center gap-2 font-semibold">
              Explore Demo
              <ArrowRight size={18} />
            </button>
            <button className="border border-slate-700 hover:border-blue-500 px-7 py-4 rounded-xl">
              View Architecture
            </button>
          </motion.div>
          <div className="grid grid-cols-3 gap-8 mt-16">
            <div>
              <h3 className="text-4xl font-bold text-blue-400">80%</h3>

              <p className="text-slate-400 mt-2">Faster Reviews</p>
            </div>

            <div>
              <h3 className="text-4xl font-bold text-blue-400">100%</h3>
              <p className="text-slate-400 mt-2">Human Oversight</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-blue-400">5</h3>
              <p className="text-slate-400 mt-2">Max Investigation Steps</p>
            </div>
          </div>
        </div>
        <Workflow />
      </div>
    </section>
  );
}
