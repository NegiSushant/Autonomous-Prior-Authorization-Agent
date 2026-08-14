"use client";

import { ExecutionStep } from "@/types/prior-auth-response";

interface ExecutionTraceProps {
  trace: ExecutionStep[];
}

const stepStyles = {
  reasoner: {
    icon: "🧠",
    label: "THINK",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    title: "text-blue-700 dark:text-blue-400",
  },

  tool: {
    icon: "🔧",
    label: "ACT / OBSERVE",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    title: "text-green-700 dark:text-green-400",
  },

  reflection: {
    icon: "🔄",
    label: "REFLECT",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    title: "text-yellow-700 dark:text-yellow-400",
  },
};

export default function ExecutionTrace({ trace }: ExecutionTraceProps) {
  if (trace.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
        No execution steps available.
      </div>
    );
  }

  return (
    <div className="relative transition-colors duration-200">
      {/* Timeline line */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-6">
        {trace.map((step, index) => {
          const style = stepStyles[step.type];
          const isAct = step.title.toLowerCase().includes("invocation");
          const isObserve = step.title.toLowerCase().includes("result");
          return (
            <div key={`${step.title}-${index}`} className="relative flex gap-4">
              {/* Timeline icon */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white dark:bg-gray-900 text-lg ${style.border}`}
              >
                {style.icon}
              </div>

              {/* Content */}
              <div
                className={`min-w-0 flex-1 rounded-xl border p-5 ${style.bg} ${style.border}`}
              >
                {/* Step header */}
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tracking-wider ${style.title}`}
                    >
                      {isAct
                        ? "ACT"
                        : isObserve
                          ? "OBSERVE"
                          : step.type === "reflection"
                            ? "REFLECT"
                            : "THINK"}
                    </span>

                    <span className="text-gray-400 dark:text-gray-600">•</span>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {step.title}
                    </h3>
                  </div>

                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    #{index + 1}
                  </span>
                </div>

                {/* Main content */}
                {step.content && (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {step.content}
                  </p>
                )}

                {/* Tool name */}
                {step.toolName && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Tool
                    </p>

                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 font-mono text-sm text-gray-800 dark:text-gray-200">
                      {step.toolName}
                    </div>
                  </div>
                )}

                {/* Tool arguments */}
                {step.toolArguments && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Tool Arguments
                    </p>

                    <pre className="overflow-x-auto rounded-lg bg-gray-900 dark:bg-[#0d1117] dark:ring-1 dark:ring-white/10 p-4 text-xs leading-5 text-green-300">
                      {JSON.stringify(step.toolArguments, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Tool result */}
                {step.toolResult !== undefined && step.toolResult !== null && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Tool Result
                    </p>

                    <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 dark:bg-[#0d1117] dark:ring-1 dark:ring-white/10 p-4 text-xs leading-5 text-cyan-300">
                      {JSON.stringify(step.toolResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
