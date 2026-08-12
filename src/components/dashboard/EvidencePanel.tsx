"use client";

import { useState } from "react";
import { ExternalLink, FileText, X } from "lucide-react";
import { EvidenceItem } from "@/types/prior-auth-response";

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(
    null,
  );

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {evidence.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
            No evidence collected.
          </div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item, index) => (
              <div
                key={`${item.documentId}-${index}`}
                className="rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  {/* Evidence Information */}
                  <div className="space-y-3">
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

                    {/* Document Citation */}
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Source Document
                      </span>

                      <div className="mt-1 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />

                        <span className="font-mono text-sm text-gray-700">
                          {item.documentId}
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedEvidence(item)}
                          className="ml-2 inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
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
                          ? "bg-green-100 text-green-700"
                          : item.status === "Unclear"
                            ? "bg-yellow-100 text-yellow-700"
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

      {/* Source Preview Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Source Document
                  </h3>

                  <p className="font-mono text-sm text-gray-500">
                    {selectedEvidence.documentId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="rounded-lg p-2 transition hover:bg-gray-100"
                aria-label="Close source document"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Content */}
            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Source Type
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedEvidence.sourceType}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedEvidence.dateFound}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Evidence Snippet
                </p>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-800">
                    {selectedEvidence.snippetText}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-500">
                  Document ID
                </p>

                <div className="rounded-lg bg-gray-900 p-3 font-mono text-sm text-green-300">
                  {selectedEvidence.documentId}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  This is a mock source document. In the production system, this
                  document ID can be used to deep-link to the original EHR,
                  pharmacy, or imaging document.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedEvidence(null)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
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