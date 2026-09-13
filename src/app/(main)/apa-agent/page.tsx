import PatientTable from "@/components/dashboard/PatientTable";
import DemoBanner from "@/components/DemoBanner";

export default function ApaAgentHome() {
  return (
    <main className="mx-auto max-w-7xl p-8 grow w-full">
      <DemoBanner />
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Prior Authorization Dashboard
      </h1>
      <PatientTable />
    </main>
  );
}

// "use client";

// import PatientTable from "@/components/dashboard/PatientTable";

// export default function ApaAgentHome() {
//   return (
//     <main className="mx-auto max-w-7xl p-8 grow w-full …">
//       <h1 className="mb-8 text-3xl font-bold …">
//         Prior Authorization Dashboard
//       </h1>
//       <PatientTable />
//     </main>
//   );
// }
