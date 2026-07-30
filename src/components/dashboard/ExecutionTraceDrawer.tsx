"use client";

import { X } from "lucide-react";
import ExecutionTrace from "./ExecutionTrace";
import { ExecutionStep } from "@/types/prior-auth-response";

interface ExecutionTraceDrawerProps {
  open: boolean;
  onClose: () => void;
  trace: ExecutionStep[];
}

export default function ExecutionTraceDrawer({
  open,
  onClose,
  trace,
}: ExecutionTraceDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Agent Execution Trace</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-72px)] overflow-y-auto p-6">
          <ExecutionTrace trace={trace} />
        </div>
      </div>
    </>
  );
}
