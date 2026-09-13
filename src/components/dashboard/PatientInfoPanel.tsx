"use client";

import {
  User,
  Mail,
  ShieldAlert,
  Activity,
  Stethoscope,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  Pill,
  Scan,
} from "lucide-react";
import { PatientFullResponseDto } from "@/types/patient.dto";
import { InfoRow } from "./patientInfoRows";

// Helper for formatting dates
const formatDate = (dateValue: Date | string | undefined) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateValue: Date | string | undefined) => {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface PatientInfoPanelProps {
  patientInfo?: PatientFullResponseDto;
}

export default function PatientInfoPanel({
  patientInfo,
}: PatientInfoPanelProps) {
  if (!patientInfo) return null;

  return (
    <div className="xl:col-span-4 space-y-6">
      {/* Main Profile Card */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Patient Information
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Full clinical profile
            </p>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <InfoRow
            label="Patient ID"
            value={patientInfo.id}
            icon={<Hash className="h-3.5 w-3.5" />}
          />
          <InfoRow
            label="Full Name"
            value={patientInfo.name}
            icon={<User className="h-3.5 w-3.5" />}
          />

          {patientInfo.email && (
            <InfoRow
              label="Email"
              value={patientInfo.email}
              icon={<Mail className="h-3.5 w-3.5" />}
            />
          )}

          <InfoRow
            label="Insurance Payer"
            value={patientInfo.insurancePayer}
            icon={<ShieldAlert className="h-3.5 w-3.5" />}
          />

          {patientInfo.diagnosisCode && (
            <InfoRow
              label="Diagnosis"
              value={patientInfo.diagnosisCode}
              icon={<Activity className="h-3.5 w-3.5" />}
            />
          )}

          {patientInfo.procedureCode && (
            <InfoRow
              label="Procedure"
              value={`${patientInfo.procedureCode} - ${patientInfo.procedureName}`}
              icon={<Stethoscope className="h-3.5 w-3.5" />}
            />
          )}

          {patientInfo.organizationId && (
            <InfoRow
              label="Org ID"
              value={patientInfo.organizationId}
              icon={<Building className="h-3.5 w-3.5" />}
            />
          )}

          <InfoRow
            label="Proceed Status"
            value={patientInfo.isProceed ? "Approved" : "Pending / Denied"}
            icon={
              patientInfo.isProceed ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )
            }
          />

          {patientInfo.createdAt && (
            <InfoRow
              label="Created At"
              value={formatDateTime(patientInfo.createdAt)}
              icon={<Calendar className="h-3.5 w-3.5" />}
            />
          )}

          {patientInfo.updatedAt && (
            <InfoRow
              label="Updated At"
              value={formatDateTime(patientInfo.updatedAt)}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
          )}
        </div>
      </div>

      {/* Clinical Notes Card */}
      {patientInfo.notes && patientInfo.notes.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Clinical Notes
            </h2>
          </div>
          <div className="space-y-4">
            {patientInfo.notes.map((note) => (
              <div
                key={note.id}
                className="text-sm border-l-2 border-emerald-400 pl-3"
              >
                <div className="flex justify-between items-center mb-1 text-xs text-gray-500 dark:text-slate-400">
                  <span>
                    {formatDate(note.noteDate)} • {note.sourceType}
                  </span>
                  <span className="text-gray-400">ID: {note.documentId}</span>
                </div>
                <p className="text-gray-800 dark:text-slate-200">
                  {note.bodyText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications Card */}
      {patientInfo.medications && patientInfo.medications.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
              <Pill className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Medications
            </h2>
          </div>
          <div className="space-y-3">
            {patientInfo.medications.map((med) => (
              <div
                key={med.id}
                className="text-sm rounded-lg bg-gray-50 dark:bg-slate-700/30 p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-gray-900 dark:text-slate-200">
                    {med.drugName}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${med.status.toLowerCase() === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}
                  >
                    {med.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-slate-400 space-y-0.5">
                  <p>Category: {med.category}</p>
                  <p>
                    Recorded: {formatDate(med.recordDate)} (Doc:{" "}
                    {med.documentId})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imaging Reports Card */}
      {patientInfo.imagingReports && patientInfo.imagingReports.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <Scan className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Imaging Reports
            </h2>
          </div>
          <div className="space-y-4">
            {patientInfo.imagingReports.map((report) => (
              <div
                key={report.id}
                className="text-sm border-l-2 border-indigo-400 pl-3"
              >
                <div className="flex justify-between items-center mb-1 text-xs text-gray-500 dark:text-slate-400">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {report.bodyPart}
                  </span>
                  <span>{formatDate(report.reportDate)}</span>
                </div>
                <p className="text-gray-800 dark:text-slate-200">
                  {report.findings}
                </p>
                <p className="mt-1 text-[10px] text-gray-400">
                  Src: {report.sourceType} | Doc: {report.documentId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
