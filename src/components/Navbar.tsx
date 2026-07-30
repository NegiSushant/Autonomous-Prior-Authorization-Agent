"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
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
    <nav className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
      <div className="flex items-center space-x-2 text-blue-600">
        <ShieldCheck size={32} />
        <Link href="/" className="text-2xl font-bold tracking-tight">
          AuthGuardian AI
        </Link>
      </div>
      <div className="space-x-6 hidden md:block text-sm font-medium text-slate-600">
        <a href="architecture" className="hover:text-blue-600">
          Architecture
        </a>
        <a href="#how-it-works" className="hover:text-blue-600">
          How It Works
        </a>
        <a href="#safety" className="hover:text-blue-600">
          Compliance & Safety
        </a>
      </div>
      <button
        onClick={handleRequestDemo}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Request Demo
      </button>
    </nav>
  );
}
