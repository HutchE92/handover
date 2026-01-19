import Link from 'next/link';
import PatientForm from '@/components/PatientForm';

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Patients
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-gray-500">Enter patient details to add them to the system</p>
      </div>

      <PatientForm mode="create" />
    </div>
  );
}
