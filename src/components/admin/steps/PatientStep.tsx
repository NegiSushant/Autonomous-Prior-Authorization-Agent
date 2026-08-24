"use client";

import { useEffect, useState } from "react";
import { Field } from "../Field";
import { inputClass } from "./constants";

export type PatientData = {
  id?: number;
  name: string;
  email: string;
  insurancePayer: string;
  diagnosisCode: string;
  procedureCode: string;
  procedureName: string;
  organizationId?: string;
};

type Props = {
  data: PatientData;
  onChange: (field: string, value: string) => void;
  mode?: "create" | "view" | "edit";
};

const INSURANCE_PAYERS = [
  { value: "Aetna", label: "Aetna" },
  { value: "Blue Cross Blue Shield", label: "Blue Cross Blue Shield" },
  { value: "Medicare", label: "Medicare" },
];

const PROCEDURE_OPTIONS = [
  {
    code: "72148",
    name: "MRI Lumbar Spine Without Contrast",
    diagnosisCodes: [
      { code: "M54.5", label: "Low back pain (M54.5)" },
      {
        code: "M51.16",
        label:
          "Intervertebral disc disorders with radiculopathy, lumbar (M51.16)",
      },
    ],
  },
  {
    code: "27447",
    name: "Total Knee Arthroplasty (Knee Replacement)",
    diagnosisCodes: [
      {
        code: "M17.11",
        label: "Unilateral primary osteoarthritis, right knee (M17.11)",
      },
      {
        code: "M17.12",
        label: "Unilateral primary osteoarthritis, left knee (M17.12)",
      },
      {
        code: "M17.0",
        label: "Bilateral primary osteoarthritis of knee (M17.0)",
      },
    ],
  },
];

type OrganizationOption = {
  id: number;
  name: string;
};

export default function PatientStep({
  data,
  onChange,
  mode = "create",
}: Props) {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const res = await fetch("/api/admin/organizations");
        const json = await res.json();

        if (res.ok && json.success) {
          setOrganizations(
            (json.data || []).map((org: { id: number; name: string }) => ({
              id: org.id,
              name: org.name,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to load organizations", err);
      } finally {
        setLoadingOrgs(false);
      }
    }

    loadOrganizations();
  }, []);

  const selectedProcedure = PROCEDURE_OPTIONS.find(
    (p) => p.code === data.procedureCode,
  );

  const handleProcedureChange = (code: string) => {
    const proc = PROCEDURE_OPTIONS.find((p) => p.code === code);
    onChange("procedureCode", code);
    onChange("procedureName", proc?.name || "");
    onChange("diagnosisCode", ""); // reset diagnosis when procedure changes
  };

  return (
    <>
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold">1. Patient Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Register the primary patient details first.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient ID */}
        {/* <Field label="Patient ID" htmlFor="patient-id" hint='e.g. "PAT006"'>
          <input
            id="patient-id"
            value={data.id}
            onChange={(e) => onChange("patientId", e.target.value)}
            placeholder="PAT006"
            className={inputClass}
            required
          />
        </Field> */}
        {/* Patient ID - Only render if NOT in create mode */}
        {mode !== "create" && (
          <Field label="Patient ID" htmlFor="patient-id" hint="System assigned">
            <input
              id="patient-id"
              value={data.id}
              readOnly
              className={`${inputClass} opacity-80 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50`}
            />
          </Field>
        )}

        {/* Full Name */}
        <Field label="Full Name" htmlFor="patient-name">
          <input
            id="patient-name"
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Jane Doe"
            className={inputClass}
            required
          />
        </Field>
        {/* Patient Email */}
        <Field label="Patient Email" htmlFor="patient-email">
          <input
            id="patient-email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="JaneDoe@email.com"
            className={inputClass}
            required
          />
        </Field>

        {/* Organization */}
        <Field
          label="Organization"
          htmlFor="organization"
          hint="Hospital / clinic this patient belongs to"
        >
          <select
            id="organization"
            value={data.organizationId || ""}
            onChange={(e) => onChange("organizationId", e.target.value)}
            className={inputClass}
            required
            disabled={loadingOrgs}
          >
            <option value="">
              {loadingOrgs ? "Loading organizations..." : "Select organization"}
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={String(org.id)}>
                {org.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Insurance Payer */}
        <Field
          label="Insurance Payer"
          htmlFor="insurance-payer"
          hint="Used for policy retrieval"
        >
          <select
            id="insurance-payer"
            value={data.insurancePayer}
            onChange={(e) => onChange("insurancePayer", e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select insurance payer</option>
            {INSURANCE_PAYERS.map((payer) => (
              <option key={payer.value} value={payer.value}>
                {payer.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Procedure Code */}
        <Field
          label="Procedure Code (CPT)"
          htmlFor="procedure-code"
          hint="Selects the procedure used for policy matching"
        >
          <select
            id="procedure-code"
            value={data.procedureCode}
            onChange={(e) => handleProcedureChange(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select procedure</option>
            {PROCEDURE_OPTIONS.map((proc) => (
              <option key={proc.code} value={proc.code}>
                {proc.code} — {proc.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Procedure Name (auto-filled, read-only) */}
        <Field
          label="Procedure Name"
          htmlFor="procedure-name"
          hint="Auto-filled from procedure code"
        >
          <input
            id="procedure-name"
            value={data.procedureName}
            readOnly
            placeholder="Select a procedure code first"
            className={`${inputClass} opacity-80 cursor-not-allowed`}
          />
        </Field>

        {/* Diagnosis Code (depends on procedure) */}
        <Field
          label="Diagnosis Code (ICD)"
          htmlFor="diagnosis-code"
          hint={
            selectedProcedure
              ? "Options limited to the selected procedure"
              : "Select a procedure first"
          }
        >
          <select
            id="diagnosis-code"
            value={data.diagnosisCode}
            onChange={(e) => onChange("diagnosisCode", e.target.value)}
            className={inputClass}
            required
            disabled={!selectedProcedure}
          >
            <option value="">
              {selectedProcedure
                ? "Select diagnosis"
                : "Select a procedure first"}
            </option>
            {selectedProcedure?.diagnosisCodes.map((dx) => (
              <option key={dx.code} value={dx.code}>
                {dx.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </>
  );
}