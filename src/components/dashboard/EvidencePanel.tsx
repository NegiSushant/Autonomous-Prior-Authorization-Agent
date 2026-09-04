"use client";

import { useState } from "react";
import { ExternalLink, FileText, X } from "lucide-react";
import { EvidenceItem } from "@/types/tools.dto";
// import { EvidenceItem } from "@/types/prior-auth-response";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(
    null,
  );

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-colors duration-200">
        {evidence.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-600 p-6 text-center text-gray-500 dark:text-slate-400">
            No evidence collected.
          </div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item, index) => (
              <div
                key={`${item.documentId}-${index}`}
                className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 transition-all hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  {/* Evidence Information */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Source
                      </span>

                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.sourceType}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Evidence
                      </span>

                      <p className="text-gray-700 dark:text-slate-300">
                        {item.snippetText}
                      </p>
                    </div>

                    {/* Document Citation */}
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
                        Source Document
                      </span>

                      <div className="mt-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />

                        <span className="font-mono text-sm text-gray-700 dark:text-slate-300">
                          {item.documentId}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedEvidence(item)}
                          className="ml-2 inline-flex items-center gap-1 rounded-md border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Source
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status + Date */}
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        item.status === "Met"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : item.status === "Unclear"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {/* {item.dateFound} */}
                      {formatDate(item.dateFound)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Source Preview Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-slate-900 shadow-2xl transition-transform">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Source Document
                  </h3>

                  <p className="font-mono text-sm text-gray-500 dark:text-slate-400">
                    {selectedEvidence.documentId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="rounded-lg p-2 text-gray-500 dark:text-slate-400 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="Close source document"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Source Type
                  </p>

                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {selectedEvidence.sourceType}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {/* {selectedEvidence.dateFound} */}
                    {formatDate(selectedEvidence.dateFound)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Evidence Snippet
                </p>

                <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4">
                  <p className="text-gray-800 dark:text-slate-200">
                    {selectedEvidence.snippetText}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Document ID
                </p>

                <div className="rounded-lg bg-gray-900 dark:bg-[#0d1117] dark:ring-1 dark:ring-white/10 p-3 font-mono text-sm text-green-300">
                  {selectedEvidence.documentId}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  This is a mock source document. In the production system, this
                  document ID can be used to deep-link to the original EHR,
                  pharmacy, or imaging document.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 dark:border-slate-700 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="rounded-lg bg-gray-900 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "N/A";

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString();
};
