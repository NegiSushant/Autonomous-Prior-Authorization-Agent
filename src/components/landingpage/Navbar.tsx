"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const handleRequestDemo = () => {
    const token = localStorage.getItem("authorization");

    if (token) {
      router.push("/apa-agent");
    } else {
      router.push("/signin");
    }
  };
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10 bg-slate-950/70"
    >
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-white font-semibold text-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          Clinical Intelligence
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-sm text-slate-300">
          <a href="#problem">Problem</a>
          <a href="#solution">Solution</a>
          <a href="#agents">Architecture</a>
          <a href="#workflow">Workflow</a>
          <a href="#contact">Contact</a>
        </div>

        <button
          onClick={handleRequestDemo}
          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition"
        >
          Request Demo
        </button>
      </div>
    </motion.nav>
  );
}
