import prismaClient from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminClinicalData from "@/components/admin/AdminClinicalData";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function PatientDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { mode = "view" } = await searchParams;

  const patient = await prismaClient.patient.findUnique({
    where: { id },
    include: {
      notes: true,
      medications: true,
      imagingReports: true,
    },
  });

  if (!patient) notFound();

  // Map Prisma fields to the shape your form expects
  const initialData = {
    patient: {
      id: patient.id,
      name: patient.name,
      insurancePayer: patient.insurancePayer,
      diagnosisCode: patient.diagnosisCode,
      procedureCode: patient.procedureCode,
      procedureName: patient.procedureName,
    },
    notes: patient.notes,
    medications: patient.medications,
    imaging: patient.imagingReports,
  };

  return (
    <AdminClinicalData
      mode={mode === "edit" ? "edit" : "view"}
      initialData={initialData}
    />
  );
}
