"use client";

import { X } from "lucide-react";
import EvidencePanel from "./EvidencePanel";
import { EvidenceItem } from "@/types/tools.dto";
// import { EvidenceItem } from "@/types/prior-auth-response";

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  evidence: EvidenceItem[];
}

export default function EvidenceDrawer({
  open,
  onClose,
  evidence,
}: EvidenceDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 top-16.25 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-16.25 z-40 flex h-[calc(100vh-65px)] w-full max-w-2xl flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-xl font-semibold">Collected Evidence</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <EvidencePanel evidence={evidence} />
        </div>
      </div>
    </>
  );
}
