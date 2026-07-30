"use client";

import { motion } from "framer-motion";
import {
  FileText,
  BrainCircuit,
  Database,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

const cards = [
  {
    icon: FileText,
    title: "Prior Authorization",
    desc: "MRI Request Received",
  },

  {
    icon: BrainCircuit,
    title: "Clinical Agent",
    desc: "Investigating Patient History",
  },

  {
    icon: Database,
    title: "EHR Search",
    desc: "Retrieving Encounters",
  },

  {
    icon: FileSearch,
    title: "Policy Validation",
    desc: "Cross Checking Guidelines",
  },

  {
    icon: ShieldCheck,
    title: "Evidence Packet",
    desc: "Ready for Physician Review",
  },
];

export default function Workflow() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-linear-to-b from-blue-500 to-cyan-500" />
      <div className="space-y-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="ml-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6"
            >
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Icon />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{card.title}</h3>
                  <p className="text-slate-400 mt-2">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
