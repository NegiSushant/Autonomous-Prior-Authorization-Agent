import {
  UserPlus,
  FileText,
  Pill,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

export const STEPS = [
  { id: "patient", title: "Patient Profile", icon: UserPlus },
  { id: "note", title: "Clinical Note", icon: FileText },
  { id: "medication", title: "Medication", icon: Pill },
  { id: "imaging", title: "Imaging", icon: ImageIcon },
  { id: "review", title: "Review", icon: CheckCircle2 },
];

// export type InitialData = {
//   patient: {
//     id?: number; // Optional DB id
//     patientId?: number;
//     name: string;
//     insurancePayer: string;
//     diagnosisCode: string;
//     procedureCode: string;
//     procedureName: string;
//     organizationId?: string;
//   };
//   notes: {
//     id?: number;
//     patientId?: number;
//     documentId: string;
//     noteDate: string;
//     bodyText: string;
//     sourceType?: string;
//   }[];
//   medications: {
//     id?: number;
//     patientId?: number;
//     documentId: string;
//     drugName: string;
//     category: string;
//     recordDate: string;
//     status: string;
//   }[];
//   imaging: {
//     id?: number;
//     patientId?: number;
//     documentId: string;
//     bodyPart: string;
//     findings: string;
//     reportDate: string;
//     sourceType?: string;
//   }[];
// };
export type InitialData = {
  patient: {
    id?: number;
    name: string;
    email: string;
    insurancePayer: string;
    diagnosisCode: string;
    procedureCode: string;
    procedureName: string;
    organizationId?: string;
  };
  notes: {
    id?: string;
    patientId?: number;
    documentId: string;
    noteDate: string;
    bodyText: string;
    sourceType?: string;
  }[];
  medications: {
    id?: string;
    patientId?: number;
    documentId: string;
    drugName: string;
    category: string;
    recordDate: string;
    status: string;
  }[];
  imaging: {
    id?: string;
    patientId?: number;
    documentId: string;
    bodyPart: string;
    findings: string;
    reportDate: string;
    sourceType?: string;
  }[];
};

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20";
