import { EvidenceItem } from "@/types/prior-auth-response";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {evidence.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
          No evidence collected.
        </div>
      ) : (
        <div className="space-y-4">
          {evidence.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Source
                    </span>

                    <p className="font-semibold text-gray-900">
                      {item.sourceType}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Evidence
                    </span>

                    <p className="text-gray-700">{item.snippetText}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      item.status === "Met"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-sm text-gray-500">
                    {item.dateFound}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
