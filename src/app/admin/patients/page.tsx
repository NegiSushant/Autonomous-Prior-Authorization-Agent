import prismaClient from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function PatientsPage() {
  const patients = await prismaClient.patient.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          notes: true,
          medications: true,
          imagingReports: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Patient Information
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage all registered patients
          </p>
        </div>

        <Link
          href="/admin/clinical-data"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} />
          Add Patient
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Show</span>
            <select className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-left transition-colors">
                <th className="px-5 py-3 font-medium">Patient ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Insurance</th>
                <th className="px-5 py-3 font-medium">Procedure</th>
                <th className="px-5 py-3 font-medium">Diagnosis</th>
                <th className="px-5 py-3 font-medium text-center">Notes</th>
                <th className="px-5 py-3 font-medium text-center">Meds</th>
                <th className="px-5 py-3 font-medium text-center">Imaging</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {patients.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    No patients found. Create one to get started.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-blue-600 dark:text-blue-400 font-medium">
                      {patient.id}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">
                      {patient.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                      {patient.insurancePayer}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {patient.procedureCode}
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {patient.procedureName}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {patient.diagnosisCode}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {patient._count.notes}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {patient._count.medications}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {patient._count.imagingReports}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/patients/${patient.id}?mode=view`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/patients/${patient.id}?mode=edit`}
                          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-semibold transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
