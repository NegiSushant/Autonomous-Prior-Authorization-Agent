interface PatientSelectorProps {
  patientId: string;
  onChange: (patientId: string) => void;
}

const patients = [
  {
    id: "PAT001",
    name: "John Doe",
  },
  {
    id: "PAT002",
    name: "Jane Smith",
  },
  {
    id: "PAT003",
    name: "Robert Johnson",
  },
  {
    id: "PAT004",
    name: "Emily Davis",
  },
  {
    id: "PAT005",
    name: "Michael Wilson",
  },
];

export default function PatientSelector({
  patientId,
  onChange,
}: PatientSelectorProps) {
  return (
    <div className="mb-6">
      <label
        htmlFor="patient"
        className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
      >
        Select Patient
      </label>

      <select
        id="patient"
        value={patientId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-2 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
      >
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.id} — {patient.name}
          </option>
        ))}
      </select>
    </div>
  );
}
