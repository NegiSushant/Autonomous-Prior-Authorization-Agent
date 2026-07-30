import { ExecutionStep } from "@/types/prior-auth-response";

interface ExecutionTraceProps {
  trace: ExecutionStep[];
}

const stepStyles = {
  reasoner: {
    icon: "🧠",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "text-blue-700",
  },
  tool: {
    icon: "🔧",
    bg: "bg-green-50",
    border: "border-green-200",
    title: "text-green-700",
  },
  reflection: {
    icon: "🔄",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    title: "text-yellow-700",
  },
};

export default function ExecutionTrace({ trace }: ExecutionTraceProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {trace.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
          No execution steps available.
        </div>
      ) : (
        <div className="space-y-5">
          {trace.map((step, index) => {
            const style = stepStyles[step.type];

            return (
              <div
                key={index}
                className={`rounded-lg border p-5 ${style.bg} ${style.border}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{style.icon}</span>

                  <div>
                    <h3 className={`text-lg font-semibold ${style.title}`}>
                      {step.title}
                    </h3>

                    <p className="mt-1 text-gray-700">{step.content}</p>
                  </div>
                </div>

                {step.toolName && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-600">
                      Tool
                    </h4>

                    <div className="rounded bg-gray-100 p-3 font-mono text-sm">
                      {step.toolName}
                    </div>
                  </div>
                )}

                {step.toolArguments && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-600">
                      Tool Arguments
                    </h4>

                    <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-green-300">
                      {JSON.stringify(step.toolArguments, null, 2)}
                    </pre>
                  </div>
                )}

                {/* {step.toolResult && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-600">
                      Tool Result
                    </h4>

                    <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-cyan-300">
                      {JSON.stringify(step.toolResult, null, 2)}
                    </pre>
                  </div>
                )} */}
                {step.toolResult !== undefined && step.toolResult !== null && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-600">
                      Tool Result
                    </h4>

                    <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-cyan-300">
                      {JSON.stringify(step.toolResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
