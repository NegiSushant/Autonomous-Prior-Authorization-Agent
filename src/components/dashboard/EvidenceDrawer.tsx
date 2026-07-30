"use client";

import { X } from "lucide-react";
import EvidencePanel from "./EvidencePanel";
import { EvidenceItem } from "@/types/prior-auth-response";

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Collected Evidence</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="h-[calc(100vh-72px)] overflow-y-auto p-6">
          <EvidencePanel evidence={evidence} />
        </div>
      </div>
    </>
  );
}
