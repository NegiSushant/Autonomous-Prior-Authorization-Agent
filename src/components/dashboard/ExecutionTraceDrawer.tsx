"use client";

import { X } from "lucide-react";
import ExecutionTrace from "./ExecutionTrace";
import { ExecutionStep } from "@/types/tools.dto";

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
      {/* Backdrop*/}
      <div
        className="fixed inset-0 top-16.25 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Drawer*/}
      <div className="fixed right-0 top-16.25 z-40 flex h-[calc(100vh-65px)] w-full max-w-3xl flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-xl font-semibold">Agent Execution Trace</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ExecutionTrace trace={trace} />
        </div>
      </div>
    </>
  );
}
